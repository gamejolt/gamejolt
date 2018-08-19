import * as path from 'path';
import { Action, Mutation, namespace, State } from 'vuex-class';

import {
	VuexAction,
	VuexModule,
	VuexMutation,
	VuexStore,
} from '../../../lib/gj-lib-client/utils/vuex';
import { SelfUpdaterInstance, SelfUpdater, Logger } from 'client-voodoo';
import * as os from 'os';
import * as fs from 'fs';
import { LocalDb } from '../../../app/components/client/local-db/local-db.service';
import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';
import { Client } from '../client.service';

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
		let cwd = nw.App.startPath;
		if (os.type() === 'Darwin') {
			cwd = path.resolve(cwd, '../../../');
		}
		return path.resolve(cwd, '..', '.manifest');
	}

	@VuexAction
	async bootstrap() {
		if (this._bootstrapPromise) {
			return;
		}

		this._startBootstrap();

		Logger.hijack(console);

		if (GJ_WITH_UPDATER) {
			this.checkForClientUpdates();
			setInterval(() => this.checkForClientUpdates(), 45 * 60 * 1000); // 45min currently
		}

		const db = await LocalDb.instance();
		this._useLocalDb(db);

		try {
			await this._migrateFrom0_12_3();
		} catch (e) {
			console.error('Caught error in migration:');
			console.error(e);
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
				window.location.href = Environment.clientSectionUrl + '/downgrade';
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
				.on('openRequested', () => {
					Client.show();
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
