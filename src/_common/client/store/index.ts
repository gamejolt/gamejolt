import * as path from 'path';
import { Action, Mutation, namespace, State } from 'vuex-class';

import {
	VuexAction,
	VuexModule,
	VuexMutation,
	VuexStore,
} from '../../../lib/gj-lib-client/utils/vuex';
import { SelfUpdaterInstance, SelfUpdater } from 'client-voodoo';
import * as os from 'os';
import * as nwGui from 'nw.gui';
import * as fs from 'fs';
import { LocalDb } from '../../../app/components/client/local-db/local-db.service';

export const ClientState = namespace('client', State);
export const ClientAction = namespace('client', Action);
export const ClientMutation = namespace('client', Mutation);

export type ClientUpdateStatus = 'checking' | 'none' | 'fetching' | 'ready' | 'error';

// These are only the public actions/mutations.
export type Actions = {
	bootstrap: undefined;
	checkForClientUpdates: undefined;
	updateClient: undefined;
};

export type Mutations = {};

@VuexModule({
	store: true,
})
export class ClientStore extends VuexStore<ClientStore, Actions, Mutations> {
	private _bootstrapPromise: Promise<void> | null = null;
	private _bootstrapPromiseResolver: Function = null as any;

	private db: LocalDb = null as any;

	// Client updater
	clientUpdateStatus: ClientUpdateStatus = 'none';
	private _updaterInstance: SelfUpdaterInstance | null = null;

	get clientManifestPath() {
		let cwd = path.dirname(process.execPath);
		if (os.type() === 'Darwin') {
			cwd = path.resolve(cwd, '../../../../../../');
		}
		return path.resolve(cwd, '..', '.manifest');
	}

	@VuexAction
	async bootstrap() {
		if (this._bootstrapPromise) {
			return;
		}

		this._startBootstrap();

		const db = await LocalDb.instance();
		this._useLocalDb(db);

		// We want to run the migration before updating because the next update is not guaranteed to have the migration logic,
		// so user data might be lost. On the other hand, we mustn't error out on migration because we need to be able to update
		// the client if there's a bug with the migration itself.
		try {
			await this._migrateFrom0_12_3();
		} catch (e) {
			console.error('Caught error in migration:');
			console.error(e);
		}

		if (GJ_WITH_UPDATER) {
			this.checkForClientUpdates();
			setInterval(() => this.checkForClientUpdates(), 45 * 60 * 1000); // 45min currently
		}

		this._bootstrapPromiseResolver();
	}

	@VuexMutation
	private _startBootstrap() {
		this._bootstrapPromise = new Promise(resolve => {
			this._bootstrapPromiseResolver = resolve;
		});
	}

	@VuexMutation
	private _useLocalDb(db: LocalDb) {
		this.db = db;
	}

	@VuexAction
	private async _migrateFrom0_12_3() {
		// The new dataPath is moved to Default folder inside what used to be the dataPath on 0.12.3
		const migrationFile = path.join(nwGui.App.dataPath, '..', '0.12.3-migration.json');
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

					fs.unlinkSync(migrationFile);
				} else {
					console.warn(
						'The migration data wasnt structured as expected, possibly lost some data :('
					);
				}
			}
		}
	}

	@VuexAction
	async checkForClientUpdates() {
		if (!GJ_WITH_UPDATER) {
			return;
		}

		try {
			console.log('Checking for client update with the new updater.');

			this._setClientUpdateStatus('checking');

			await this._ensureUpdaterInstance();

			console.log('Sending checkForClientUpdates...');
			const checked = await this._updaterInstance!.checkForUpdates();
			if (!checked) {
				throw new Error('Failed to check for updates');
			}
		} catch (err) {
			console.error(err);
			this._setClientUpdateStatus('error');
		}
	}

	@VuexAction
	async updateClient() {
		if (!GJ_WITH_UPDATER) {
			return;
		}

		try {
			console.log('updateClient in clientLibrary store: ' + JSON.stringify(GJ_WITH_UPDATER));
			let updateStarted = false;
			if (this.clientUpdateStatus === 'ready') {
				await this._ensureUpdaterInstance();
				updateStarted = await this._updaterInstance!.updateApply();
			}

			if (!updateStarted) {
				throw new Error('Failed to apply the update');
			}
		} catch (err) {
			console.error(err);
			this._setClientUpdateStatus('error');
		}
	}

	@VuexMutation
	private _setClientUpdateStatus(status: ClientUpdateStatus) {
		console.log('set client update state: ' + status);
		this.clientUpdateStatus = status;
	}

	@VuexMutation
	private _setUpdaterInstance(instance: SelfUpdaterInstance) {
		this._updaterInstance = instance;
	}

	@VuexMutation
	private _clearUpdaterInstance() {
		this._updaterInstance = null;
	}

	@VuexAction
	private async _ensureUpdaterInstance(): Promise<void> {
		if (!this._updaterInstance) {
			console.log('Attaching selfupdater instance for manifest ' + this.clientManifestPath);

			const thisInstance = await SelfUpdater.attach(this.clientManifestPath);
			this._setUpdaterInstance(thisInstance);

			thisInstance
				.on('noUpdateAvailable', () => {
					this._setClientUpdateStatus('none');
				})
				.on('updateAvailable', () => {
					thisInstance
						.updateBegin()
						.catch((err: Error) => {
							console.error(err);
							this._setClientUpdateStatus('error');
						})
						.then(began => {
							if (!began) {
								throw new Error('Failed to begin update');
							}
						});
				})
				.on('updateBegin', () => {
					this._setClientUpdateStatus('fetching');
				})
				.on('updateReady', () => {
					this._setClientUpdateStatus('ready');
				})
				.on('updateApply', () => {
					nw.Window.get().close(true);
				})
				.on('updateFailed', (reason: string) => {
					console.error('Failed to update. Joltron says: ' + reason);
					this._setClientUpdateStatus('error');
				})
				.on('fatal', (err: Error) => {
					console.error(err);
					this._setClientUpdateStatus('error');

					this._disposeUpdaterInstance(thisInstance);
				});
		}
	}

	@VuexAction
	private async _disposeUpdaterInstance(instance: SelfUpdaterInstance) {
		// Try to cleanly disconnect and dispose of the controller so we can try again with a new one.
		try {
			instance.controller.disconnect();
		} catch (err) {}

		// If somehow we failed to disconnect and are processing events even after receiving a fatal event
		instance.removeAllListeners();

		// Setting the instance to null allows the updater to retry with a new one.
		if (this._updaterInstance === instance) {
			this._clearUpdaterInstance();
		}
	}
}

export const store = new ClientStore();
