import { State, namespace, Action, Mutation, Getter } from 'vuex-class';
import {
	LocalDbPackage,
	DbFieldTypes as PackageFields,
} from '../components/client/local-db/package/package.model';
import {
	LocalDbGame,
	DbFieldTypes as GameFields,
} from '../components/client/local-db/game/game.model';
import {
	VuexModule,
	VuexStore,
	VuexAction,
	VuexMutation,
	VuexGetter,
} from '../../lib/gj-lib-client/utils/vuex';
import { db } from '../components/client/local-db/local-db.service';
import {
	Patcher,
	PatchInstance,
	PatchEvents,
	State as PatcherState,
	Launcher,
	LaunchInstance,
	OldLaunchInstance,
	Queue,
	Rollbacker,
	Uninstaller,
	MsgResultResponse,
	Config,
} from 'client-voodoo';
import { Settings } from '../components/settings/settings.service';
import { Api } from '../../lib/gj-lib-client/components/api/api.service';
import * as fs from 'fs';
import * as path from 'path';
import * as nwGui from 'nw.gui';
import {
	RemoveState as PackageRemoveState,
	PatchState,
	Progress,
} from '../components/client/local-db/package/package.model';
import { Growls } from '../../lib/gj-lib-client/components/growls/growls.service';
import { HistoryTick } from '../../lib/gj-lib-client/components/history-tick/history-tick-service';
import { Game } from '../../lib/gj-lib-client/components/game/game.model';
import { GamePackage } from '../../lib/gj-lib-client/components/game/package/package.model';
import { GameRelease } from '../../lib/gj-lib-client/components/game/release/release.model';
import { GameBuild } from '../../lib/gj-lib-client/components/game/build/build.model';
import { GameBuildLaunchOption } from '../../lib/gj-lib-client/components/game/build/launch-option/launch-option.model';
import { DbFieldMapping as PackageDbFields } from '../components/client/local-db/package/package.model';
import { DbFieldMapping as GameDbFields } from '../components/client/local-db/game/game.model';
import { EventBus } from '../../lib/gj-lib-client/components/event-bus/event-bus.service';
import { arrayRemove } from '../../lib/gj-lib-client/utils/array';
import { Device } from '../../lib/gj-lib-client/components/device/device.service';

const sanitize = require('sanitize-filename');

export const ClientLibraryState = namespace('clientLibrary', State);
export const ClientLibraryAction = namespace('clientLibrary', Action);
export const ClientLibraryMutation = namespace('clientLibrary', Mutation);
export const ClientLibraryGetter = namespace('clientLibrary', Getter);

export type Actions = {
	'clientLibrary/bootstrap': undefined;
	'clientLibrary/clear': undefined;
	'clientLibrary/setPackageFieldsAndSave': [LocalDbPackage, Partial<PackageFields>];
	'clientLibrary/setGameFieldsAndSave': [LocalDbGame, Partial<GameFields>];
	'clientLibrary/packageInstall': [
		Game,
		GamePackage,
		GameRelease,
		GameBuild,
		GameBuildLaunchOption[]
	];
	'clientLibrary/packageStartUpdate': [LocalDbPackage, number];
	'clientLibrary/packageUninstall': [LocalDbPackage, boolean];
	'clientLibrary/installerInit': undefined;
	'clientLibrary/retryAllInstallations': undefined;
	'clientLibrary/installerRetry': LocalDbPackage;
	'clientLibrary/installerInstall': [LocalDbGame, LocalDbPackage];
	'clientLibrary/installerPause': LocalDbPackage;
	'clientLibrary/installerResume': LocalDbPackage;
	'clientLibrary/installerCancel': LocalDbPackage;
	'clientLibrary/installerRollback': LocalDbPackage;
	'clientLibrary/installerUninstall': LocalDbPackage;
	'clientLibrary/launcherInit': undefined;
	'clientLibrary/launcherLaunch': LocalDbPackage;
	'clientLibrary/launcherReattach': LocalDbPackage;
	'clientLibrary/launcherAttach': [LocalDbPackage, LaunchInstance | OldLaunchInstance];
	'clientLibrary/launcherClear': LocalDbPackage;
	'clientLibrary/syncCheck': undefined;
	'clientLibrary/syncGame': [number, GameFields];
	'clientLibrary/syncPackage': [number, any];
};

export type Mutations = {
	'clientLibrary/_startBootstrap': undefined;
	'clientLibrary/_bootstrap': {
		packages: LocalDbPackage[];
		games: LocalDbGame[];
	};
	'clientLibrary/setCurrentlyPatching': [LocalDbPackage, PatchInstance];
	'clientLibrary/unsetCurrentlyPatching': LocalDbPackage;
	'clientLibrary/setCurrentlyUninstalling': [LocalDbPackage, Promise<void>];
	'clientLibrary/unsetCurrentlyUninstalling': LocalDbPackage;
	'clientLibrary/setPackageFields': Actions['clientLibrary/setPackageFieldsAndSave'];
	'clientLibrary/setGameFields': Actions['clientLibrary/setGameFieldsAndSave'];
	'clientLibrary/checkQueueSettings': undefined;
	'clientLibrary/setLauncherReady': boolean;
	'clientLibrary/setCurrentlyPlaying': LocalDbPackage;
	'clientLibrary/unsetCurrentlyPlaying': LocalDbPackage;
	'clientLibrary/syncInit': undefined;
	'clientLibrary/syncSetInterval': NodeJS.Timer;
	'clientLibrary/syncClear': undefined;
};

// Action types
// Type aliases can't be used as async function return types because of a nasty Typescript compiler bug.
// It fails to detect the down-level aliased Promise type is compilant with the es3/5 promises, so it has to be backed with a type.
// See https://github.com/Microsoft/TypeScript/issues/12776 for more info
export type ReturnTypeBootstrap = Promise<void>;
export type ReturnTypeClear = Promise<void>;
export type ReturnTypeSetPackageFieldsAndSave = Promise<number>;
export type ReturnTypeSetGameFieldsAndSave = Promise<number>;
export type ReturnTypePackageInstall = Promise<void>;
export type ReturnTypePackageStartUpdate = Promise<boolean>;
export type ReturnTypePackageUninstall = Promise<void>;
export type ReturnTyeInstallerInit = Promise<Promise<void>[]>;
export type ReturnTypeRetryAllInstallations = Promise<Promise<void>[]>;
export type ReturnTypeInstallerRetry = Promise<void>;
export type ReturnTypeInstallerInstall = Promise<void>;
export type ReturnTypeInstallerPause = Promise<MsgResultResponse>;
export type ReturnTypeInstallerResume = Promise<MsgResultResponse | void>;
export type ReturnTypeInstallerCancel = Promise<boolean>;
export type ReturnTypeInstallerRollback = Promise<number>;
export type ReturnTypeInstallerUninstall = Promise<void>;
export type ReturnTypeLauncherInit = Promise<void>;
export type ReturnTypeLauncherLaunch = Promise<void>;
export type ReturnTypeLauncherReattach = Promise<void>;
export type ReturnTypeLauncherAttach = Promise<number>;
export type ReturnTypeLauncherClear = Promise<number>;
export type ReturnTypeSyncInit = Promise<void>;
export type ReturnTypeSyncCheck = Promise<[number[], number[], boolean[]]>;
export type ReturnTypeSyncGame = Promise<number>;
export type ReturnTypeSyncPackage = Promise<number>;

export const ReturnTypeBootstrap = Promise;
export const ReturnTypeClear = Promise;
export const ReturnTypeSetPackageFieldsAndSave = Promise;
export const ReturnTypeSetGameFieldsAndSave = Promise;
export const ReturnTypePackageInstall = Promise;
export const ReturnTypePackageStartUpdate = Promise;
export const ReturnTypePackageUninstall = Promise;
export const ReturnTyeInstallerInit = Promise;
export const ReturnTypeRetryAllInstallations = Promise;
export const ReturnTypeInstallerRetry = Promise;
export const ReturnTypeInstallerInstall = Promise;
export const ReturnTypeInstallerPause = Promise;
export const ReturnTypeInstallerResume = Promise;
export const ReturnTypeInstallerCancel = Promise;
export const ReturnTypeInstallerRollback = Promise;
export const ReturnTypeInstallerUninstall = Promise;
export const ReturnTypeLauncherInit = Promise;
export const ReturnTypeLauncherLaunch = Promise;
export const ReturnTypeLauncherReattach = Promise;
export const ReturnTypeLauncherAttach = Promise;
export const ReturnTypeLauncherClear = Promise;
export const ReturnTypeSyncInit = Promise;
export const ReturnTypeSyncCheck = Promise;
export const ReturnTypeSyncGame = Promise;
export const ReturnTypeSyncPackage = Promise;

@VuexModule()
export class ClientLibraryStore extends VuexStore<ClientLibraryStore, Actions, Mutations> {
	private _bootstrapPromise: Promise<void> | null = null;
	private _bootstrapPromiseResolver: Function = null as any;

	packages: LocalDbPackage[] = [];
	games: LocalDbGame[] = [];

	// Installer variables
	currentlyPatching: { [packageId: number]: PatchInstance } = {};
	private currentlyUninstalling: { [packageId: number]: Promise<void> | undefined } = {};

	// Launcher variables
	isLauncherReady = false;
	currentlyPlaying: LocalDbPackage[] = [];

	// Syncer variables
	private syncCheckInterval: NodeJS.Timer = null as any;

	@VuexAction
	async bootstrap(): ReturnTypeBootstrap {
		if (this._bootstrapPromise) {
			return;
		}

		this._startBootstrap();

		// TODO(rewrite) - port migrator

		const [packages, games] = await Promise.all([
			// Need these type hints because dexie returns its own Dexie.Promises.
			db.packages.toArray() as Promise<LocalDbPackage[]>,
			db.games.toArray() as Promise<LocalDbGame[]>,
		]);

		this._bootstrap({ packages, games });

		if (GJ_ENVIRONMENT === 'development') {
			Config.env = 'development';
		}

		this.installerInit();
		this.launcherInit();
		this.syncInit();

		this._bootstrapPromiseResolver();
	}

	@VuexMutation
	private _startBootstrap() {
		this._bootstrapPromise = new Promise(resolve => {
			this._bootstrapPromiseResolver = resolve;
		});
	}

	@VuexMutation
	private _bootstrap({ packages, games }: Mutations['clientLibrary/_bootstrap']) {
		console.log('Set packages');
		console.log(packages);

		for (let localPackage of packages) {
			localPackage.setBuildData(localPackage.build);
		}
		this.packages = packages;

		for (let localGame of games) {
			localGame._game = new Game(localGame);
		}
		this.games = games;

		// If we need to do something like cross process indexeddb changes we'd have to use these hooks.
		// These allow us to reflect changes to indexeddb in the store's local games and packages arrays.
		// We have to make sure we do everything when the transaction completes and not before.
		// db.games.hook('creating', (_id, localGame, trans) => {
		// 	trans.on('complete', () => {
		// 		this.games.push(localGame);
		// 	});
		// });
		// db.packages.hook('creating', (_id, localPackage, trans) => {
		// 	trans.on('complete', () => {
		// 		this.packages.push(localPackage);
		// 	});
		// });
		// db.games.hook('deleting', (id, _localGame, trans) => {
		// 	trans.on('complete', () => {
		// 		arrayRemove(this.games, localGame => localGame.id === id);
		// 	});
		// });
		// db.packages.hook('deleting', (id, _localPackage, trans) => {
		// 	trans.on('complete', () => {
		// 		arrayRemove(this.packages, localPackage => localPackage.id === id);
		// 	});
		// });
	}

	@VuexAction
	async clear(): ReturnTypeClear {
		if (this._bootstrapPromise) {
			await this._bootstrapPromise;
		}

		// TODO(rewrite): clear stuff
		this.syncClear();

		this._bootstrapPromise = null;
	}

	get packagesById() {
		console.log('Fetching packages by id');
		return this.packages.reduce<{
			[packageId: number]: LocalDbPackage;
		}>((accum, _package) => {
			accum[_package.id] = _package;
			return accum;
		}, {});
	}

	get gamesById() {
		return this.games.reduce<{
			[gameId: number]: LocalDbGame;
		}>((accum, game) => {
			accum[game.id] = game;
			return accum;
		}, {});
	}

	get packagesByGameId() {
		return this.packages.reduce<{
			[gameId: number]: LocalDbPackage[];
		}>((accum, _package) => {
			if (!accum[_package.game_id]) {
				accum[_package.game_id] = [];
			}
			accum[_package.game_id].push(_package);
			return accum;
		}, {});
	}

	/**
	 * Returns a package that is representative of this game's current state.
	 * For example, if a package is installing, we will return that.
	 * It should return a single package for a game, even if they have multiple
	 * installed.
	 */
	@VuexGetter
	findActiveForGame(gameId: number) {
		console.log('Finding active package for game: ' + gameId);
		console.log(this.packages);
		console.log(this.packagesByGameId);
		const localPackages = this.packagesByGameId[gameId];
		if (!localPackages || !localPackages.length) {
			return null;
		}

		for (let localPackage of localPackages) {
			if (localPackage.install_state) {
				return localPackage;
			}
		}

		return localPackages[0];
	}

	get numPatching() {
		return Object.keys(this.currentlyPatching).length;
	}

	@VuexMutation
	private setCurrentlyPatching(
		[localPackage, patchInstance]: Mutations['clientLibrary/setCurrentlyPatching']
	) {
		if (!this.currentlyPatching[localPackage.id]) {
			this.currentlyPatching[localPackage.id] = patchInstance;
		}
	}

	@VuexMutation
	private unsetCurrentlyPatching(localPackage: Mutations['clientLibrary/unsetCurrentlyPatching']) {
		delete this.currentlyPatching[localPackage.id];
	}

	get currentPatchingProgress() {
		if (!this.numPatching) {
			return null;
		}

		let currentProgress = 0;
		let numPatching = this.numPatching;
		for (let packageIdStr in this.currentlyPatching) {
			const packageId = parseInt(packageIdStr, 10);
			const progress = this.getPackagePatchProgress(packageId);

			// If the progress is null, we don't count that package progress as part of the total progress,
			// because it means there was some unexpected error with the stored package.
			if (progress == null) {
				numPatching -= 1;
				continue;
			}

			currentProgress += progress;
		}
		return currentProgress / numPatching;
	}

	@VuexMutation
	private setCurrentlyUninstalling(
		[localPackage, uninstallPromise]: Mutations['clientLibrary/setCurrentlyUninstalling']
	) {
		if (this.currentlyUninstalling[localPackage.id]) {
			return;
		}

		this.currentlyUninstalling[localPackage.id] = uninstallPromise;
	}

	@VuexMutation
	private unsetCurrentlyUninstalling(
		localPackage: Mutations['clientLibrary/unsetCurrentlyUninstalling']
	) {
		if (!this.currentlyUninstalling[localPackage.id]) {
			return;
		}

		delete this.currentlyUninstalling[localPackage.id];
	}

	@VuexAction
	async setPackageFieldsAndSave(
		[localPackage, fields]: Actions['clientLibrary/setPackageFieldsAndSave']
	): ReturnTypeSetPackageFieldsAndSave {
		this.setPackageFields([localPackage, fields]);
		const dbId = await db.packages.put(localPackage);
		if (!this.packagesById[localPackage.id]) {
			this.packages.push(localPackage);
		}
		return dbId;
	}

	@VuexMutation
	setPackageFields([localPackage, fields]: Mutations['clientLibrary/setPackageFields']) {
		let key: keyof typeof fields;
		for (key in fields) {
			key = PackageDbFields[key];
			if (key === 'build') {
				localPackage.setBuildData(fields.build!);
				continue;
			}
			localPackage[key] = fields[key]!;
		}
	}

	@VuexAction
	async setGameFieldsAndSave(
		[localGame, fields]: Actions['clientLibrary/setGameFieldsAndSave']
	): ReturnTypeSetGameFieldsAndSave {
		this.setGameFields([localGame, fields]);
		const dbId = await db.games.put(localGame);
		if (!this.gamesById[localGame.id]) {
			this.games.push(localGame);
		}
		return dbId;
	}

	@VuexMutation
	setGameFields([localGame, fields]: Mutations['clientLibrary/setGameFields']) {
		let key: keyof typeof fields;
		for (key in fields) {
			key = GameDbFields[key];
			localGame[key] = fields[key]!;
		}
	}

	@VuexGetter
	getPackagePatchProgress(packageId: number) {
		const localPackage = this.packages[packageId];
		if (localPackage.download_progress) {
			return localPackage.download_progress.progress;
		} else if (localPackage.unpack_progress) {
			return localPackage.unpack_progress.progress;
		}
		return null;
	}

	@VuexAction
	async packageInstall(
		[game, package_, release, build, launchOptions]: Actions['clientLibrary/packageInstall']
	): ReturnTypePackageInstall {
		HistoryTick.sendBeacon('game-build', build.id, {
			sourceResource: 'Game',
			sourceResourceId: game.id,
		});
		HistoryTick.sendBeacon('game-build-install', build.id, {
			sourceResource: 'Game',
			sourceResourceId: game.id,
		});

		const localGame = LocalDbGame.fromGame(game);
		const localPackage = LocalDbPackage.createForInstall(package_, release, build, launchOptions);

		await db.transaction('rw', [db.games, db.packages], async () => {
			await Promise.all([db.games.put(localGame), db.packages.put(localPackage)]);
			this.games.push(localGame);
			this.packages.push(localPackage);
		});

		return this.installerInstall([localGame, localPackage]);
	}

	@VuexAction
	async packageStartUpdate(
		[localPackage, newBuildId]: Actions['clientLibrary/packageStartUpdate']
	): ReturnTypePackageStartUpdate {
		// If this package isn't installed (and at rest), we don't update.
		// We also don't update if we're currently running the game. Imagine that happening!
		if (!localPackage.isSettled || localPackage.isRunning) {
			return false;
		}

		const response = await Api.sendRequest(`/web/client/get-build-for-update/${newBuildId}`, null, {
			detach: true,
		});
		if (!response || !response.package) {
			return false;
		}

		await this.setPackageFieldsAndSave([
			localPackage,
			{
				update: LocalDbPackage.createForUpdate(
					response.package,
					response.release,
					response.build,
					response.launchOptions
				),
			},
		]);

		const game = this.gamesById[localPackage.game_id];
		this.installerInstall([game, localPackage]);
		return true;
	}

	@VuexAction
	async packageUninstall(
		[localPackage, dbOnly]: Actions['clientLibrary/packageUninstall']
	): ReturnTypePackageUninstall {
		// We just use this so they don't click "uninstall" twice in a row.
		// No need to save to the DB.
		let currentlyUninstalling = this.currentlyUninstalling[localPackage.id];
		if (currentlyUninstalling) {
			console.log('Not doing uninstall again because already uninstalling');
			return currentlyUninstalling;
		}

		// Optimally the entire uninstalling promise would run in a single indexeddb transaction,
		// but dexie has an issue with keeping a transaction alive for the duration: http://dexie.org/docs/Dexie/Dexie.transaction().html
		// Basically if there is a node tick that doesn't 'use' or 'wait on' an indexeddb transaction operation the transaction auto commits,
		// so we can't do things like asyncronously waiting on filesystem. Therefore we had to split the transaction into chunks.
		currentlyUninstalling = (async () => {
			// Are we removing a current install?
			const wasInstalling = localPackage.isInstalling;

			// Used to abort the promise chain in the middle.
			let abortAll = false;

			let localGame: LocalDbGame | undefined;

			try {
				// Cancel any installs first.
				// It may or may not be patching.
				const isCurrentlyPatching = await this.installerCancel(localPackage);

				// If uninstalling has to interrupt a patch operation that is curerntly in progress
				// we abort the uninstall promise because it'll be called again from the client installer's promise chain.
				// We need to make sure the uninstall promise doesn't exist by then.
				// TODO: This is a horrible hack we're going to put up with until the overhaul in the vue codebase.
				// Get rid of this asap, this flow is ridiculous
				if (isCurrentlyPatching) {
					abortAll = true;
					this.unsetCurrentlyUninstalling(localPackage);
					throw new Error(
						'The package uninstall promise chain is aborted. If this was thrown, aborting was not handled correctly.'
					);
				}

				// We refetch from db because if cancelling a first installation it might remove the local game from the db.
				localGame = await db.games.get(localPackage.game_id);

				// Make sure we're clean.
				await this.setPackageFieldsAndSave([
					localPackage,
					{
						install_state: null,
						download_progress: null,
						unpack_progress: null,
						patch_paused: null,
						patch_queued: null,
						remove_state: PackageRemoveState.REMOVING,
					},
				]);

				// Skip removing the package if we don't want to actually uninstall from disk.
				if (!dbOnly) {
					console.log('Doing uninstall');
					await this.installerUninstall(localPackage);
				}

				// Get the number of packages in this game.
				const count = await db.packages.where('game_id').equals(localPackage.game_id).count();

				await db.transaction('rw', [db.games, db.packages], async () => {
					// Note that some times a game is removed before the package (really weird cases).
					// We still want the remove to go through, so be sure to skip this situation.
					// If this is the last package for the game, remove the game since we no longer need it.
					if (localGame && count <= 1) {
						await db.games.delete(localGame.id);
					}

					await db.packages.delete(localPackage.id);
				});

				// Finally remove from the vuex store.
				if (localGame && count <= 1) {
					arrayRemove(this.games, g => g.id === localGame!.id);
				}
				arrayRemove(this.packages, p => p.id === localPackage.id);

				if (!wasInstalling) {
					Growls.success(
						'Removed ' +
							(localPackage.title || (localGame ? localGame.title : 'the package')) +
							' from your computer.',
						'Package Removed'
					);
				} else {
					Growls.success(
						'Canceled installation of ' +
							(localPackage.title || (localGame ? localGame.title : 'the package')),
						'Installation Canceled'
					);
				}
			} catch (err) {
				console.error(err);
				if (abortAll) {
					return;
				}

				if (wasInstalling) {
					Growls.error('Could not stop the installation.');
				} else {
					Growls.error(
						'Could not remove ' +
							(localPackage.title || (localGame ? localGame.title : 'the package')) +
							'.',
						'Remove Failed'
					);
				}

				await localPackage.setRemoveState(PackageRemoveState.REMOVE_FAILED);
			} finally {
				this.unsetCurrentlyUninstalling(localPackage);
			}
		})();

		this.setCurrentlyUninstalling([localPackage, currentlyUninstalling]);
		return currentlyUninstalling;
	}

	@VuexMutation
	checkQueueSettings() {
		Queue.faster = {
			downloads: Settings.get('max-download-count'),
			extractions: Settings.get('max-extract-count'),
		};

		if (Settings.get('queue-when-playing')) {
			Queue.slower = {
				downloads: 0,
				extractions: 0,
			};
		} else {
			Queue.slower = Queue.faster;
		}
	}

	@VuexAction
	installerInit(): ReturnTyeInstallerInit {
		this.checkQueueSettings();

		return this.retryAllInstallations();
	}

	@VuexAction
	retryAllInstallations(): ReturnTypeRetryAllInstallations {
		const promises = [];
		// This will retry to install anything that was installing before client was closed.
		for (let packageId in this.packages) {
			const localPackage = this.packages[packageId];
			if (localPackage.isPatching && !localPackage.isPatchPaused) {
				promises.push(this.installerRetry(localPackage));
			}
		}

		return Promise.resolve(promises);
	}

	@VuexAction
	async installerRetry(
		localPackage: Actions['clientLibrary/installerRetry']
	): ReturnTypeInstallerRetry {
		// Reset states.
		const downloadStates = [PatchState.DOWNLOADING, PatchState.DOWNLOAD_FAILED];
		const unpackStates = [PatchState.UNPACKING, PatchState.UNPACK_FAILED];

		if (localPackage.install_state) {
			if (downloadStates.indexOf(localPackage.install_state) !== -1) {
				await localPackage.setInstallState(PatchState.PATCH_PENDING);
			} else if (unpackStates.indexOf(localPackage.install_state) !== -1) {
				await localPackage.setInstallState(PatchState.DOWNLOADED);
			}
		} else if (localPackage.update_state) {
			if (downloadStates.indexOf(localPackage.update_state || '') !== -1) {
				await localPackage.setUpdateState(PatchState.PATCH_PENDING);
			} else if (unpackStates.indexOf(localPackage.update_state || '') !== -1) {
				await localPackage.setUpdateState(PatchState.DOWNLOADED);
			}
		}

		const game = this.gamesById[localPackage.game_id];
		return this.installerInstall([game, localPackage]);
	}

	@VuexAction
	async installerInstall(
		[localGame, localPackage]: Actions['clientLibrary/installerInstall']
	): ReturnTypeInstallerInstall {
		const packageId = localPackage.id;
		const authTokenGetter = () => LocalDbPackage.getAccessToken(packageId);

		let authToken = '';
		try {
			authToken = await authTokenGetter();
		} catch (err) {
			console.log(`Could not get access token for package ${packageId}`);
			console.warn(err);
		}

		const operation = localPackage.install_state ? 'install' : 'update';
		let packageTitle = localPackage.title || localGame.title;
		if (packageTitle !== localGame.title) {
			packageTitle += ' for ' + localGame.title;
		}

		try {
			// We freeze the installation directory in time.
			if (!localPackage.install_dir) {
				const title = sanitize(localPackage.title || 'default');
				await localPackage.setInstallDir(
					path.join(
						Settings.get('game-install-dir'),
						`${localGame.slug}-${localGame.id}`,
						`${title}-${packageId}`
					)
				);
			}

			// If we were paused before, let's resume.
			// This happens if they paused, then restarted client. The patch would still be paused
			// but if they click resume we want to start a new install again.
			if (localPackage.isPatchPaused) {
				await localPackage.setPatchResumed();
			}

			const patchInstance = await Patcher.patch(localPackage as any, authTokenGetter, {
				authToken,
			});
			const canceled = await new Promise<boolean>((resolve, reject) => {
				this.setCurrentlyPatching([localPackage, patchInstance]);

				const listeners: Partial<PatchEvents> = {};
				const cleanupListeners = () => {
					// Remove all listeners we bound to patch instance so it won't update the local package after the operation is done.
					for (let i_event in listeners) {
						const event: keyof PatchEvents = i_event as any;
						patchInstance.removeListener(event, listeners[event]!);
						delete listeners[event];
					}
				};

				patchInstance
					.on(
						'state',
						(listeners.state = state => {
							switch (state) {
								case PatcherState.Downloading:
									if (localPackage.install_state) {
										localPackage.setInstallState(PatchState.DOWNLOADING);
									} else if (localPackage.update_state) {
										localPackage.setUpdateState(PatchState.DOWNLOADING);
									}
									break;

								case PatcherState.Patching:
									// No longer needed.
									this.setPackageFields([localPackage, { download_progress: null }]);

									if (localPackage.install_state) {
										localPackage.setInstallState(PatchState.UNPACKING);
									} else if (localPackage.update_state) {
										localPackage.setUpdateState(PatchState.UNPACKING);
									}
									break;
							}
						})
					)
					.on(
						'progress',
						(listeners.progress = progress => {
							const progressType = progress.type;

							const newProgress: Progress = {
								// Newer version of client voodoo return progress as an integer between 0-100,
								// but old client-voodoo returned a float between 0-1.
								// To maintain compatibility, make this function return the float always.
								progress: progress.percent / 100,

								timeLeft: Math.round(
									(progress.total - progress.current) /
										(progress.sample ? progress.sample.movingAverage : 1)
								),

								// divide by 1024 to convert to kbps
								rate: progress.sample ? Math.round(progress.sample.movingAverage / 1024) : 0,
							};

							if (progressType === 'download') {
								this.setPackageFieldsAndSave([
									localPackage,
									{
										download_progress: newProgress,
									},
								]);
							} else {
								this.setPackageFieldsAndSave([
									localPackage,
									{
										unpack_progress: newProgress,
									},
								]);
							}
						})
					)
					.on(
						'paused',
						(listeners.paused = queued => {
							console.log(
								'Pause received in gamejolt repo. From queue: ' + (queued ? 'yes' : 'no')
							);

							if (queued) {
								localPackage.setPatchQueued();
							} else {
								localPackage.setPatchPaused();
							}
						})
					)
					.on(
						'resumed',
						(listeners.resumed = unqueued => {
							console.log(
								'Resume received in gamejolt repo. From queue: ' + (unqueued ? 'yes' : 'no')
							);

							if (unqueued) {
								localPackage.setPatchUnqueued();
							} else {
								localPackage.setPatchResumed();
							}
						})
					)
					.on(
						'updateFailed',
						(listeners.updateFailed = reason => {
							cleanupListeners();

							// If the update was canceled the 'context canceled' will be emitted as the updateFailed reason.
							if (reason === 'context canceled') {
								return resolve(true);
							}
							reject(new Error(reason));
						})
					)
					.on(
						'updateFinished',
						(listeners.updateFinished = () => {
							cleanupListeners();
							resolve(false);
						})
					)
					.on(
						'fatal',
						(listeners.fatal = err => {
							cleanupListeners();

							console.log('Received fatal error in patcher in gamejolt repo: ' + err.message);
							reject(err);
						})
					);
			});

			this.unsetCurrentlyPatching(localPackage);

			if (!canceled) {
				if (localPackage.install_state) {
					await localPackage.setInstalled();
				} else if (localPackage.update_state) {
					await localPackage.setUpdated();
				}

				const action =
					operation === 'install' ? 'finished installing' : 'updated to the latest version';
				const title = operation === 'install' ? 'Game Installed' : 'Game Updated';
				Growls.success(`${packageTitle} has ${action}.`, title);
			} else {
				console.log('Canceling running installation/update');
				console.log(localPackage);
				console.log(localPackage.install_state);

				// If we were cancelling the first installation - we have to treat the package as uninstalled.
				if (operation === 'install') {
					console.log('Canceled a first installation, Marking as uninstalled from db');

					// Calling uninstall normally attempts to spawn a client voodoo uninstall instance.
					// Override that because the uninstallation should be done automatically by the installation process.
					await localPackage.uninstall(true);
				} else {
					console.log('Canceled an update operation. Attempting to rollback.');
					try {
						await this.installerRollback(localPackage);
						await localPackage.setUpdateAborted();
						Growls.success(`${packageTitle} aborted the update.`, 'Update Aborted');
					} catch (err) {
						if (localPackage.update_state === PatchState.UNPACKING) {
							await localPackage.setUpdateState(PatchState.UNPACK_FAILED);
						} else {
							await localPackage.setUpdateState(PatchState.DOWNLOAD_FAILED);
						}
						Growls.error(
							`${packageTitle} cannot abort at this time. Retry or uninstall it.`,
							'Update Failed'
						);
					}
				}
			}
		} catch (err) {
			console.error(err);

			const action = operation === 'install' ? 'install' : 'update';
			const title = operation === 'install' ? 'Installation Failed' : 'Update Failed';
			Growls.error(`${packageTitle} failed to ${action}.`, title);

			if (localPackage.install_state) {
				if (localPackage.install_state === PatchState.UNPACKING) {
					await localPackage.setInstallState(PatchState.UNPACK_FAILED);
				} else {
					await localPackage.setInstallState(PatchState.DOWNLOAD_FAILED);
				}
			} else if (localPackage.update_state) {
				if (localPackage.update_state === PatchState.UNPACKING) {
					await localPackage.setUpdateState(PatchState.UNPACK_FAILED);
				} else {
					await localPackage.setUpdateState(PatchState.DOWNLOAD_FAILED);
				}
			}

			this.unsetCurrentlyPatching(localPackage);
		}
	}

	@VuexAction
	installerPause(localPackage: Actions['clientLibrary/installerPause']): ReturnTypeInstallerPause {
		const patchInstance = this.currentlyPatching[localPackage.id];
		if (!patchInstance) {
			throw new Error('Package is not installing.');
		}

		return patchInstance.pause();
	}

	@VuexAction
	async installerResume(
		localPackage: Actions['clientLibrary/installerResume']
	): ReturnTypeInstallerResume {
		const patchInstance = this.currentlyPatching[localPackage.id];
		if (!patchInstance) {
			return this.installerRetry(localPackage);
		}

		let authToken = '';
		try {
			authToken = await LocalDbPackage.getAccessToken(localPackage.id);
		} catch (err) {
			console.log(`Could not get access token for package ${localPackage.id}`);
			console.error(err);
		}

		return patchInstance.resume({ authToken });
	}

	@VuexAction
	async installerCancel(
		localPackage: Actions['clientLibrary/installerCancel']
	): ReturnTypeInstallerCancel {
		const patchInstance = this.currentlyPatching[localPackage.id];
		if (!patchInstance) {
			return false;
		}

		console.log('Cancelling running installation');
		await patchInstance.cancel();
		console.log('Cancelled running installation');
		return true;
	}

	@VuexAction
	async installerRollback(
		localPackage: Actions['clientLibrary/installerRollback']
	): ReturnTypeInstallerRollback {
		const rollbackInstance = await Rollbacker.rollback(localPackage as any);
		await new Promise((resolve, reject) => {
			rollbackInstance
				.on('rollbackFailed', (reason: string) => {
					console.log(`Received rollbackFailed in gamejolt: ${reason}`);
					reject(new Error(reason));
				})
				.on('rollbackFinished', () => {
					console.log('Received rollbackFinished in gamejolt');
					resolve();
				})
				.on('fatal', reject);
		});
		return localPackage.setUpdateAborted();
	}

	@VuexAction
	async installerUninstall(
		localPackage: Actions['clientLibrary/installerUninstall']
	): ReturnTypeInstallerUninstall {
		const uninstallInstance = await Uninstaller.uninstall(localPackage as any);
		return new Promise<void>((resolve, reject) => {
			uninstallInstance
				.on('uninstallFinished', () => resolve())
				.on('uninstallFailed', reject)
				.on('fatal', reject);
		});
	}

	@VuexAction
	async launcherInit(): ReturnTypeLauncherInit {
		const pidDir = path.resolve(nwGui.App.dataPath, 'game-pids');
		Config.setPidDir(pidDir);

		try {
			await Config.ensurePidDir();

			// Get all running packages by looking at the old launcher's game pid directory.
			// This finds games that were started outside the client as well.
			const runningPackageIds = fs
				.readdirSync(pidDir)
				.map(filename => {
					// Pid files are named after the package ids they are currently running.
					try {
						return parseInt(path.basename(filename), 10);
					} catch (err) {
						return 0;
					}
				})
				.filter(packageId => !!packageId && !isNaN(packageId));

			console.log(`Running package ids by game pid file: [${runningPackageIds.join(',')}]`);

			// For all the packages that have a game pid file and aren't marked as running in the localdb - mark as running before attaching.
			// This will mark them as runnig using the old client launcher's running format.
			const markedAsRunning: Promise<number>[] = [];
			for (let runningPackageId of runningPackageIds) {
				const localPackage = this.packagesById[runningPackageId];
				if (localPackage && !localPackage.isRunning) {
					markedAsRunning.push(
						localPackage
							.setRunningPid({
								wrapperId: localPackage.id.toString(),
							})
							.catch(err => {
								console.warn(`Could not mark package as running: ${localPackage.id}`);
								console.warn(err);
								return 0;
							})
					);
				}
			}

			await Promise.all(markedAsRunning);

			// Reattach all running games after a restart.
			const reattachingPromises = this.packages
				.filter(localPackage => localPackage.isRunning)
				.map(localPackage => {
					this.launcherReattach(localPackage).catch((err: Error) => {
						console.warn(err);
						// We catch here to make sure failing reattachment doesn't make Promise.all return early.
						// This is because we need all attachment operations to complete reliably before starting the migration.
						return null;
					});
				});

			// We only mark the launcher as loaded once it at least finished reattaching to the currently running instances.
			// This is so that the migrator can check when the packages are no longer running.
			await Promise.all(reattachingPromises);
			console.log('Launcher loaded and ready');

			this.setLauncherReady(true);
		} catch (err) {
			console.error('Failed to initialize everything for launcher');
			console.error(err);
			this.setLauncherReady(true);
		}
	}

	@VuexMutation
	setLauncherReady(ready: Mutations['clientLibrary/setLauncherReady']) {
		this.isLauncherReady = ready;
	}

	get runningPackageIds() {
		return this.currentlyPlaying.map(localPackage => localPackage.id);
	}

	@VuexMutation
	setCurrentlyPlaying(localPackage: Mutations['clientLibrary/setCurrentlyPlaying']) {
		this.currentlyPlaying.push(localPackage);
	}

	@VuexMutation
	unsetCurrentlyPlaying(localPackage: Mutations['clientLibrary/unsetCurrentlyPlaying']) {
		arrayRemove(this.currentlyPlaying, localPackage2 => localPackage.id === localPackage2.id);
	}

	@VuexAction
	async launcherLaunch(
		localPackage: Actions['clientLibrary/launcherLaunch']
	): ReturnTypeLauncherLaunch {
		try {
			await localPackage.setLaunching();

			let payload: any = null;
			try {
				payload = await Api.sendRequest('/web/dash/token/get-for-game', {
					game_id: localPackage.game_id,
				});
			} catch (err) {
				console.log('Could not get game token to launch with - launching anyways');
				console.warn(err);
			}

			const credentials =
				payload && payload.username && payload.token
					? { username: payload.username, user_token: payload.token }
					: null;

			// return Launcher.launch( localPackage, os, arch, credentials ).promise;
			const launchInstance = await Launcher.launch(localPackage as any, credentials);
			this.launcherAttach([localPackage, launchInstance]);
		} catch (err) {
			console.error(err);
			Growls.error('Could not launch game.');
			this.launcherClear(localPackage);
		}
	}

	@VuexAction
	async launcherReattach(
		localPackage: Actions['clientLibrary/launcherReattach']
	): ReturnTypeLauncherReattach {
		if (!localPackage.running_pid) {
			throw new Error('Package is not running');
		}

		try {
			const launchInstance = await Launcher.attach(localPackage.running_pid);
			this.launcherAttach([localPackage, launchInstance]);
		} catch (err) {
			console.log(`Could not reattach launcher instance: ${localPackage.running_pid}`);
			console.error(err);
			this.launcherClear(localPackage);
		}
	}

	@VuexAction
	launcherAttach(
		[localPackage, launchInstance]: Actions['clientLibrary/launcherAttach']
	): ReturnTypeLauncherAttach {
		this.setCurrentlyPlaying(localPackage);

		// Typescript for some reason can't detect that all possible types of launchInstance have a .on( 'gameOver' ), so we have to assert type.
		if (launchInstance instanceof LaunchInstance) {
			launchInstance.on('gameOver', () => this.launcherClear(localPackage));
		} else {
			launchInstance.on('gameOver', () => this.launcherClear(localPackage));
		}

		EventBus.emit('ClientLauncher.gameLaunched', this.currentlyPlaying.length);

		return localPackage.setRunningPid(launchInstance.pid);
	}

	@VuexAction
	launcherClear(localPackage: Actions['clientLibrary/launcherClear']): ReturnTypeLauncherClear {
		const numPlaying = this.currentlyPlaying.length;
		this.unsetCurrentlyPlaying(localPackage);
		const newNumPlaying = this.currentlyPlaying.length;
		if (numPlaying !== newNumPlaying) {
			EventBus.emit('ClientLauncher.gameClosed', newNumPlaying);
		}

		return localPackage.clearRunningPid();
	}

	@VuexAction
	async syncInit(): ReturnTypeSyncInit {
		this.syncCheck();
		this.syncSetInterval(setInterval(() => this.syncCheck(), 60 * 60 * 1000)); // 1hr currently
	}

	@VuexMutation
	syncSetInterval(interval: Mutations['clientLibrary/syncSetInterval']) {
		this.syncCheckInterval = interval;
	}

	@VuexMutation
	syncClear() {
		clearInterval(this.syncCheckInterval);
	}

	@VuexAction
	async syncCheck(): ReturnTypeSyncCheck {
		console.log('Checking for updates');
		const builds = this.packages.map(localPackage => localPackage.build);

		const os = Device.os();
		const arch = Device.arch();

		const request: any = {
			games: {},
			builds: {},
			os: os,
			arch: arch,
		};

		// The modified_on fields are what tells us if the client has up to date info
		// for each model.
		for (let localGame of this.games) {
			request.games[localGame.id] = localGame.modified_on || 0;
		}

		for (let build of builds) {
			request.builds[build.id] = build.modified_on || 0;
		}

		console.log(request);
		const response = await Api.sendRequest('/web/client/sync', request, {
			detach: true,

			// If we allowed it to sanitize, it would filter out arrays in the request.
			sanitizeComplexData: false,
		});
		console.log(response);

		// Don't do anything if we don't have anything to update.
		if (
			response &&
			((response.builds && response.builds.length) ||
				(response.games && response.games.length) ||
				(response.updateBuilds && response.updateBuilds.length))
		) {
			const gamePromises = db.transaction('rw', [db.games], async () => {
				const promises = (response.games as any[]).map((game: any) =>
					this.syncGame([game.id, game])
				);
				return await Promise.all(promises);
			});

			const packagePromises = db.transaction('rw', [db.packages], async () => {
				const promises = (response.builds as any[]).map((build: any) =>
					this.syncPackage([build.game_package_id, response])
				);
				return await Promise.all(promises);
			});

			const updatePromises = Promise.all(
				(response.updateBuilds as any[]).map((data: any) => {
					// TODO(rewrite,cros) do we want to wrap these in a try catch so we don't fail the rest of the update operations?
					// Since this isn't running in a db transaction if a single fails it won't rollback the others,
					// so we might just want to log.
					const packageId: number = data.packageId;
					const newBuildId: number = data.newBuildId;

					const localPackage = this.packagesById[packageId];
					if (!localPackage) {
						throw new Error('Package is not set in localdb');
					}

					return this.packageStartUpdate([localPackage, newBuildId]);
				})
			);

			return await Promise.all<number[], number[], boolean[]>([
				gamePromises,
				packagePromises,
				updatePromises,
			]);
		} else {
			return [[], [], []];
		}
	}

	@VuexAction
	async syncGame([gameId, data]: Actions['clientLibrary/syncGame']): ReturnTypeSyncGame {
		const localGame = this.gamesById[gameId];
		if (!localGame) {
			throw new Error('Game is not set in localdb');
		}

		return await localGame.setDataAndSave(data);
	}

	@VuexAction
	async syncPackage(
		[packageId, data]: Actions['clientLibrary/syncPackage']
	): ReturnTypeSyncPackage {
		const localPackage = this.packagesById[packageId];
		if (!localPackage) {
			throw new Error('Game is not set in localdb');
		}

		const package_ = (data.packages as GamePackage[]).find(a => a.id === localPackage.id);
		const release = (data.release as GameRelease[]).find(a => a.id === localPackage.release.id);
		const build = (data.builds as GameBuild[]).find(a => a.id === localPackage.build.id);
		const launchOptions = (data.launchOptions as GameBuildLaunchOption[]).filter(
			a => a.game_build_id === localPackage.build.id
		);

		// If those are not set then this package is not even valid.
		if (!package_ || !release || !build) {
			throw new Error(
				`Package ${localPackage.id} is no longer valid. ` +
					`The payload did not contain the package, it's release (${localPackage.release.id})` +
					` or it's build (${localPackage.build.id})`
			);
		}

		// Assign so we don't lose fields.
		localPackage.setData(package_, release, build, launchOptions);
		return await db.packages.put(localPackage);
	}
}
