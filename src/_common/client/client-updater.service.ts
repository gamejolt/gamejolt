import { Logger, MsgProgress, PatcherState, SelfUpdater, SelfUpdaterInstance } from 'client-voodoo';
import * as fs from 'fs-extra';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import { Navigate } from 'game-jolt-frontend-lib/components/navigate/navigate.service';
import { makeObservableService } from 'game-jolt-frontend-lib/utils/vue';
import * as path from 'path';
import { LocalDb } from '../../app/components/client/local-db/local-db.service';
import { Client } from './client.service';

export type ClientUpdateStatus = 'checking' | 'none' | 'fetching' | 'ready' | 'error';

export abstract class ClientUpdater {
	private static initPromise: Promise<void> | null = null;
	private static initPromiseResolver: Function = null as any;

	private static db: LocalDb = null as any;

	// Updater fields
	private static _clientUpdateStatus: ClientUpdateStatus = 'none';
	private static _clientUpdateProgress: MsgProgress | null = null;

	private static updaterInstance: SelfUpdaterInstance | null = null;
	private static updaterInstanceBuilder: Promise<SelfUpdaterInstance> | null = null;

	static get clientUpdateStatus() {
		return this._clientUpdateStatus;
	}

	static get clientUpdateProgress() {
		return this._clientUpdateProgress;
	}

	static get hasUpdaterConnectivity() {
		return this.updaterInstance && this.updaterInstance.controller.connected;
	}

	private static setClientUpdateStatus(status: ClientUpdateStatus) {
		console.log('set client update state: ' + status);
		this._clientUpdateStatus = status;

		if (this.clientUpdateStatus !== 'fetching') {
			this._clientUpdateProgress = null;
		}
	}

	static async init() {
		if (this.initPromise) {
			return this.initPromise;
		}

		this.initPromise = new Promise(resolve => {
			this.initPromiseResolver = resolve;
		});

		Logger.hijack(console);

		if (GJ_WITH_UPDATER) {
			this.checkForClientUpdates();
			setInterval(() => this.checkForClientUpdates(), 45 * 60 * 1000); // 45min currently
		}

		this.db = await LocalDb.instance();

		try {
			await this._migrateFrom0_12_3();
		} catch (e) {
			console.error('Caught error in migration:');
			console.error(e);
		}

		this.initPromiseResolver();
	}

	private static async _migrateFrom0_12_3() {
		// The new dataPath is different than the old 0.12.3 dataPath,
		// and is also different for each OS, so we find the root of the data path by crawling up the directory tree
		// till we end up at the root of client data folder.
		let oldDataPath = nw.App.dataPath;
		for (let i = 0; path.basename(oldDataPath) !== 'game-jolt-client'; i++) {
			const nextDataPath = path.dirname(oldDataPath);
			if (nextDataPath === oldDataPath || i > 3) {
				console.warn('Failed to find the old data path');
				return;
			}
			oldDataPath = nextDataPath;
		}

		const migrationFile = path.join(oldDataPath, '0.12.3-migration.json');
		console.log('Expecting to find migration file in ' + migrationFile);

		if (fs.existsSync(migrationFile)) {
			console.log('Migrating data from 0.12.3');

			const migrationDataStr = fs.readFileSync(migrationFile, { encoding: 'utf8' });
			if (!migrationDataStr) {
				console.warn('The migration data file is empty, possibly lost some data :(');
			} else {
				let data = null;
				try {
					data = JSON.parse(migrationDataStr);
				} catch (e) {
					console.warn(
						'The migration data could not be parsed, possibly lost some data :('
					);
					console.error(e);
				}

				if (data && data.indexeddb && data.localStorage) {
					await this.db.packages.clear();
					await this.db.games.clear();
					localStorage.clear();

					const indexeddb = data.indexeddb;

					for (let gameId in indexeddb.games) {
						this.db.games.put(indexeddb.games[gameId]);
					}
					for (let packageId in indexeddb.packages) {
						this.db.packages.put(indexeddb.packages[packageId]);
					}
					await Promise.all([this.db.games.save(), this.db.packages.save()]);

					for (let key of Object.keys(data.localStorage)) {
						localStorage.setItem(key, data.localStorage[key]);
					}

					fs.writeFileSync(path.join(nw.App.dataPath, '0.12.3-migrated'), '');
					fs.unlinkSync(migrationFile);
				} else {
					console.warn(
						'The migration data wasnt structured as expected, possibly lost some data :('
					);
				}
			}
		} else if (
			// On platforms where the new data path is the same as the old 0.12.3 data path we can't
			// check if the new version is a fresh install or if we skipped the migration.
			// This is because traces of the IndexedDB folder from the old version are no longer valid
			// indication of an old version existing.
			path.normalize(oldDataPath) !== path.normalize(nw.App.dataPath) &&
			fs.existsSync(path.join(oldDataPath, 'IndexedDB'))
		) {
			if (!fs.existsSync(path.join(nw.App.dataPath, '0.12.3-migrated'))) {
				console.warn('Running from new version without exporting the 0.12.3 data.');
				Navigate.goto(Environment.clientSectionUrl + '/downgrade');
			}
		}
	}

	static async checkForClientUpdates() {
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
			const checked = await updaterInstance.checkForUpdates();
			if (!checked) {
				throw new Error('Failed to check for updates');
			}
		} catch (err) {
			console.error(err);
			this.setClientUpdateStatus('error');
		}
	}

	static async updateClient() {
		if (!GJ_WITH_UPDATER) {
			return;
		}

		try {
			console.log('updateClient in clientLibrary store: ' + JSON.stringify(GJ_WITH_UPDATER));

			const updaterInstance = await this.ensureUpdaterInstance();

			let updateStarted = false;
			if (this.clientUpdateStatus === 'ready') {
				updateStarted = await updaterInstance.updateApply();
			}

			if (!updateStarted) {
				throw new Error('Failed to apply the update');
			}
		} catch (err) {
			console.error(err);
			this.setClientUpdateStatus('error');
		}
	}

	private static async ensureUpdaterInstance(): Promise<SelfUpdaterInstance> {
		return this.updaterInstance || (await this.createUpdaterInstance());
	}

	private static async createUpdaterInstance() {
		if (this.updaterInstanceBuilder) {
			return this.updaterInstanceBuilder;
		}

		const builder = new Promise<SelfUpdaterInstance>(async (resolve, reject) => {
			let thisInstance: SelfUpdaterInstance | null = null;
			try {
				const manifestPath = path.resolve(Client.joltronDir, '.manifest');
				console.log('Attaching selfupdater instance for manifest ' + manifestPath);

				thisInstance = await SelfUpdater.attach(manifestPath);

				thisInstance
					.on('noUpdateAvailable', () => {
						this.setClientUpdateStatus('none');
					})
					.on('updateAvailable', () => {
						thisInstance!
							.updateBegin()
							.catch((err: Error) => {
								console.error(err);
								this.setClientUpdateStatus('error');
							})
							.then(began => {
								if (!began) {
									throw new Error('Failed to begin update');
								}
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
						Client.show();
					})
					.on('progress', (progress: MsgProgress) => {
						console.log('progress received');
						console.log(progress);
						this._clientUpdateProgress = progress;
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

				// Sync the current state of joltron. We might be in the middle of a self update already.
				const state = await thisInstance.controller.sendGetState(false, 5000);
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

				this.updaterInstance = thisInstance;

				resolve(thisInstance);
			} catch (err) {
				try {
					this.setClientUpdateStatus('error');
					if (thisInstance) {
						this.disposeUpdaterInstance(thisInstance);
					}
				} catch (_) {}
				reject(err);
			} finally {
				this.updaterInstanceBuilder = null;
			}
		});

		this.updaterInstanceBuilder = builder;
		return builder;
	}

	private static async disposeUpdaterInstance(instance: SelfUpdaterInstance) {
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
}

makeObservableService(ClientUpdater);
