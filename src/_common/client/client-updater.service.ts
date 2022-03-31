import { reactive } from '@vue/reactivity';
import type { MsgProgress, SelfUpdaterInstance } from 'client-voodoo';
import { Navigate } from '../navigate/navigate.service';
import { Logger, PatcherState, SelfUpdater } from './client-voodoo-imports';
import { Client } from './client.service';
import { markRaw } from 'vue';

const path = require('path') as typeof import('path');

export type ClientUpdateStatus = 'checking' | 'none' | 'fetching' | 'ready' | 'error';

class ClientUpdaterService {
	private initPromise: Promise<void> | null = null;

	// Updater fields
	private myClientUpdateStatus: ClientUpdateStatus = 'none';
	private myClientUpdateProgress: MsgProgress | null = null;

	private updaterInstance: SelfUpdaterInstance | null = null;
	private updaterInstanceBuilder: Promise<SelfUpdaterInstance> | null = null;

	get clientUpdateStatus() {
		return this.myClientUpdateStatus;
	}

	get clientUpdateProgress() {
		return this.myClientUpdateProgress;
	}

	get hasUpdaterConnectivity() {
		return this.updaterInstance && this.updaterInstance.controller.connected;
	}

	private setClientUpdateStatus(status: ClientUpdateStatus) {
		console.log('set client update state: ' + status);
		this.myClientUpdateStatus = status;

		if (this.clientUpdateStatus !== 'fetching') {
			this.setClientUpdateProgress(null);
		}
	}

	private setClientUpdateProgress(progress: MsgProgress | null) {
		this.myClientUpdateProgress = progress;
	}

	async init() {
		if (this.initPromise) {
			return this.initPromise;
		}

		let initPromiseResolver: () => void = null as any;
		this.initPromise = new Promise(resolve => {
			initPromiseResolver = resolve;
		});

		Logger.hijack(console);
		Navigate.registerDestructor(() => Logger.unhijack());

		if (GJ_WITH_UPDATER) {
			this.checkForClientUpdates();
			setInterval(() => this.checkForClientUpdates(), 45 * 60 * 1000); // 45min currently
		}

		initPromiseResolver();
	}

	async checkForClientUpdates() {
		if (!GJ_WITH_UPDATER) {
			return;
		}

		try {
			const updaterInstance = await this.ensureUpdaterInstance();

			if (
				this.clientUpdateStatus === 'checking' ||
				this.clientUpdateStatus === 'fetching' ||
				this.clientUpdateStatus === 'ready'
			) {
				console.log('Client already updating');
				return;
			}

			console.log('Checking for client update with the new updater.');
			this.setClientUpdateStatus('checking');

			console.log('Sending checkForClientUpdates...');
			try {
				await updaterInstance.checkForUpdates();
			} catch (err) {
				// There is a race condition when a client that needs to be force updated is started.
				// After initializing the client updater service and starting an update the client
				// figures out it has to force update and redirects to the client section.
				// The client updater is initialized again and somehow doesn't figure out an update has already
				// begun and attempt to check for updates again. Joltron responds with the following error message.
				//
				// This should not be possible because at the time of initializing the updater service
				// it checks the current state of joltron before attempting to check for updates and would skip
				// the check if its already in progress. Something weird is going on.
				//
				// Either way, this is an error we should be able to tolerate and just try syncing with joltron's state again.
				if (err && err.message === 'Already running an update') {
					await this.queryUpdaterState(updaterInstance);
				} else {
					throw err;
				}
			}
		} catch (err) {
			console.error(err);
			this.setClientUpdateStatus('error');
		}
	}

	async updateClient() {
		if (!GJ_WITH_UPDATER) {
			return;
		}

		try {
			console.log('updateClient in clientLibrary store: ' + JSON.stringify(GJ_WITH_UPDATER));

			const updaterInstance = await this.ensureUpdaterInstance();

			if (this.clientUpdateStatus !== 'ready') {
				throw new Error('Failed to apply the update. Joltron is not in a ready state');
			}

			await updaterInstance.updateApply();
		} catch (err) {
			console.error(err);
			this.setClientUpdateStatus('error');
		}
	}

	private async ensureUpdaterInstance(): Promise<SelfUpdaterInstance> {
		return this.updaterInstance || (await this.createUpdaterInstance());
	}

	private async createUpdaterInstance() {
		if (this.updaterInstanceBuilder) {
			return this.updaterInstanceBuilder;
		}

		const builder = (async (): Promise<SelfUpdaterInstance> => {
			let thisInstance: SelfUpdaterInstance | null = null;
			try {
				const manifestPath = path.resolve(Client.joltronDir, '.manifest');
				console.log('Attaching selfupdater instance for manifest ' + manifestPath);

				thisInstance = markRaw(await SelfUpdater.attach(manifestPath));
				Navigate.registerDestructor(() => this.disposeUpdaterInstance(thisInstance!));

				thisInstance
					.on('noUpdateAvailable', () => {
						this.setClientUpdateStatus('none');
					})
					.on('updateAvailable', () => {
						thisInstance!.updateBegin().catch((err: Error) => {
							console.error(err);
							this.setClientUpdateStatus('error');
						});
					})
					.on('updateBegin', () => {
						this.setClientUpdateStatus('fetching');
					})
					.on('updateReady', () => {
						this.setClientUpdateStatus('ready');
					})
					.on('updateApply', () => {
						nw.Window.get().close(true);
					})
					.on('openRequested', () => {
						console.log('received open request');
						Client.show();
					})
					.on('progress', (progress: MsgProgress) => {
						console.log('progress received');
						this.setClientUpdateProgress(progress);
					})
					.on('updateFailed', (reason: string) => {
						console.error('Failed to update. Joltron says: ' + reason);
						this.setClientUpdateStatus('error');
					})
					.on('fatal', (err: Error) => {
						console.error(err);
						this.setClientUpdateStatus('error');

						this.disposeUpdaterInstance(thisInstance!);
					});

				await this.queryUpdaterState(thisInstance);

				this.updaterInstance = thisInstance;

				return thisInstance;
			} catch (err) {
				console.error(err);
				try {
					this.setClientUpdateStatus('error');
					if (thisInstance) {
						this.disposeUpdaterInstance(thisInstance);
					}
				} catch (_) {}

				throw err;
			} finally {
				this.updaterInstanceBuilder = null;
			}
		})();

		this.updaterInstanceBuilder = builder;
		return builder;
	}

	private async disposeUpdaterInstance(instance: SelfUpdaterInstance) {
		// Try to cleanly disconnect and dispose of the controller so we can try again with a new one.
		try {
			instance.controller.disconnect();
		} catch (_) {}

		// If somehow we failed to disconnect and are processing events even after receiving a fatal event
		instance.removeAllListeners();

		// Setting the instance to null allows the updater to retry with a new one.
		if (this.updaterInstance === instance) {
			this.updaterInstance = null;
		}
	}

	// Queries the current state of joltron. We might already by in the middle of an update,
	// or even ready to apply an update that finished processing.
	private async queryUpdaterState(instance: SelfUpdaterInstance) {
		console.log('Checking current status of joltron...');
		const state = await instance.controller.sendGetState(false, 5000);
		console.log('Current joltron status: ');
		console.log(state);

		if (state.state !== 'updating') {
			this.setClientUpdateStatus('none');
		} else {
			switch (state.patcherState) {
				case PatcherState.UpdateReady:
					this.setClientUpdateStatus('ready');
					break;

				case PatcherState.Start:
				case PatcherState.Preparing:
				case PatcherState.Download:
				case PatcherState.PrepareExtract:
				case PatcherState.Extract:
				case PatcherState.Cleanup:
					this.setClientUpdateStatus('fetching');
					break;
			}
		}
	}
}

export const ClientUpdater = reactive(new ClientUpdaterService()) as ClientUpdaterService;
