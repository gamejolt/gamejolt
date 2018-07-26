import {
	Config,
	Launcher,
	LaunchInstance,
	OldLaunchInstance,
	Patcher,
	PatchEvents,
	PatchInstance,
	Queue,
	Rollbacker,
	State as PatcherState,
	Uninstaller,
} from 'client-voodoo';
import * as fs from 'fs';

import * as path from 'path';
import Vue from 'vue';
import { Action, Mutation, namespace, State } from 'vuex-class';

import { Settings } from '../../_common/settings/settings.service';
import { Api } from '../../lib/gj-lib-client/components/api/api.service';
import { Device } from '../../lib/gj-lib-client/components/device/device.service';
import { GameBuild } from '../../lib/gj-lib-client/components/game/build/build.model';
import { GameBuildLaunchOption } from '../../lib/gj-lib-client/components/game/build/launch-option/launch-option.model';
import { Game } from '../../lib/gj-lib-client/components/game/game.model';
import { GamePackage } from '../../lib/gj-lib-client/components/game/package/package.model';
import { GameRelease } from '../../lib/gj-lib-client/components/game/release/release.model';
import { Growls } from '../../lib/gj-lib-client/components/growls/growls.service';
import { HistoryTick } from '../../lib/gj-lib-client/components/history-tick/history-tick-service';
import { arrayGroupBy, arrayIndexBy, arrayRemove } from '../../lib/gj-lib-client/utils/array';
import {
	VuexAction,
	VuexGetter,
	VuexModule,
	VuexMutation,
	VuexStore,
} from '../../lib/gj-lib-client/utils/vuex';
import { LocalDbGame } from '../components/client/local-db/game/game.model';
import { db } from '../components/client/local-db/local-db.service';
import {
	LocalDbPackage,
	LocalDbPackagePid,
	LocalDbPackagePatchState,
	LocalDbPackageProgress,
	LocalDbPackageRemoveState,
	LocalDbPackageRunState,
} from '../components/client/local-db/package/package.model';
import { fuzzysearch } from '../../lib/gj-lib-client/utils/string';

export const ClientLibraryState = namespace('clientLibrary', State);
export const ClientLibraryAction = namespace('clientLibrary', Action);
export const ClientLibraryMutation = namespace('clientLibrary', Mutation);

export type ClientUpdateStatus = 'checking' | 'none' | 'fetching' | 'ready' | 'error';

// These are only the public actions/mutations.
export type Actions = {
	'clientLibrary/bootstrap': undefined;
	'clientLibrary/packageInstall': [
		Game,
		GamePackage,
		GameRelease,
		GameBuild,
		GameBuildLaunchOption[]
	];
	'clientLibrary/packageStartUpdate': [LocalDbPackage, number];
	'clientLibrary/packageUninstall': [LocalDbPackage, boolean];
	'clientLibrary/installerRetry': LocalDbPackage;
	'clientLibrary/installerPause': LocalDbPackage;
	'clientLibrary/installerResume': LocalDbPackage;
	'clientLibrary/launcherLaunch': LocalDbPackage;
};

export type Mutations = {
	'clientLibrary/checkQueueSettings': undefined;
	'clientLibrary/syncInit': undefined;
	'clientLibrary/syncSetInterval': NodeJS.Timer;
	'clientLibrary/syncClear': undefined;
};

@VuexModule()
export class ClientLibraryStore extends VuexStore<ClientLibraryStore, Actions, Mutations> {
	private _bootstrapPromise: Promise<void> | null = null;
	private _bootstrapPromiseResolver: Function = null as any;

	// Localdb variables
	packages: LocalDbPackage[] = [];
	games: LocalDbGame[] = [];

	// Installer variables
	currentlyPatching: { [packageId: number]: PatchInstance } = {};
	currentlyUninstalling: { [packageId: number]: Promise<void> | undefined } = {};

	// Launcher variables
	isLauncherReady = false;
	currentlyPlaying: LocalDbPackage[] = [];

	get packagesById() {
		return arrayIndexBy(this.packages, 'id');
	}

	get gamesById() {
		return arrayIndexBy(this.games, 'id');
	}

	get packagesByGameId() {
		return arrayGroupBy(this.packages, 'game_id');
	}

	get runningPackageIds() {
		return this.currentlyPlaying.map(localPackage => localPackage.id);
	}

	get numPlaying() {
		return this.currentlyPlaying.length;
	}

	get numPatching() {
		return Object.keys(this.currentlyPatching).length;
	}

	get totalPatchProgress() {
		if (!this.numPatching) {
			return null;
		}

		let currentProgress = 0;
		let numPatching = this.numPatching;
		for (let packageId in this.currentlyPatching) {
			const progress = this.packagesById[packageId].patchProgress;

			// If the progress is null, we don't count that package progress as part of the total
			// progress, because it means there was some unexpected error with the stored package.
			if (progress === null) {
				numPatching -= 1;
				continue;
			}

			currentProgress += progress;
		}

		return currentProgress / numPatching;
	}

	@VuexAction
	async bootstrap() {
		if (this._bootstrapPromise) {
			return;
		}

		this._startBootstrap();

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

		this.syncCheck();
		setInterval(() => this.syncCheck(), 60 * 60 * 1000); // 1hr currently

		this._bootstrapPromiseResolver();
	}

	@VuexMutation
	private _startBootstrap() {
		this._bootstrapPromise = new Promise(resolve => {
			this._bootstrapPromiseResolver = resolve;
		});
	}

	@VuexMutation
	private _bootstrap({ packages, games }: { packages: LocalDbPackage[]; games: LocalDbGame[] }) {
		this.packages = packages;
		this.games = games;
	}

	/**
	 * Returns a package that is representative of this game's current state.
	 * For example, if a package is installing, we will return that.
	 * It should return a single package for a game, even if they have multiple
	 * installed.
	 */
	@VuexGetter
	findActiveForGame(gameId: number) {
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

	@VuexGetter
	searchInstalledGames(query: string, limit = 3) {
		query = query.toLowerCase();
		return this.games
			.filter(i => fuzzysearch(query, i.title.toLowerCase()))
			.sort((g1, g2) => g1.title.localeCompare(g2.title))
			.slice(0, limit);
	}

	@VuexMutation
	private setCurrentlyPatching([localPackage, patchInstance]: [LocalDbPackage, PatchInstance]) {
		if (!this.currentlyPatching[localPackage.id]) {
			Vue.set(this.currentlyPatching, localPackage.id + '', patchInstance);
		}
	}

	@VuexMutation
	private unsetCurrentlyPatching(localPackage: LocalDbPackage) {
		Vue.delete(this.currentlyPatching, localPackage.id + '');
	}

	@VuexMutation
	private setCurrentlyUninstalling(
		[localPackage, uninstallPromise]: [LocalDbPackage, Promise<void>]
	) {
		if (this.currentlyUninstalling[localPackage.id]) {
			return;
		}

		Vue.set(this.currentlyUninstalling, localPackage.id + '', uninstallPromise);
	}

	@VuexMutation
	private unsetCurrentlyUninstalling(localPackage: LocalDbPackage) {
		if (!this.currentlyUninstalling[localPackage.id]) {
			return;
		}

		Vue.delete(this.currentlyUninstalling, localPackage.id + '');
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
	private installerInit() {
		this.checkQueueSettings();
		return this.retryAllInstallations();
	}

	@VuexAction
	private retryAllInstallations() {
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
	async installerRetry(localPackage: Actions['clientLibrary/installerRetry']) {
		// Reset states.
		const downloadStates = [
			LocalDbPackagePatchState.DOWNLOADING,
			LocalDbPackagePatchState.DOWNLOAD_FAILED,
		];
		const unpackStates = [
			LocalDbPackagePatchState.UNPACKING,
			LocalDbPackagePatchState.UNPACK_FAILED,
		];

		if (localPackage.install_state) {
			if (downloadStates.indexOf(localPackage.install_state) !== -1) {
				this.setPackageInstallState([localPackage, LocalDbPackagePatchState.PATCH_PENDING]);
			} else if (unpackStates.indexOf(localPackage.install_state) !== -1) {
				this.setPackageInstallState([localPackage, LocalDbPackagePatchState.DOWNLOADED]);
			}
		} else if (localPackage.update_state) {
			if (downloadStates.indexOf(localPackage.update_state || '') !== -1) {
				this.setPackageUpdateState([localPackage, LocalDbPackagePatchState.PATCH_PENDING]);
			} else if (unpackStates.indexOf(localPackage.update_state || '') !== -1) {
				this.setPackageUpdateState([localPackage, LocalDbPackagePatchState.DOWNLOADED]);
			}
		}

		const game = this.gamesById[localPackage.game_id];
		return this.doPatch([game, localPackage]);
	}

	@VuexAction
	private async doPatch([localGame, localPackage]: [LocalDbGame, LocalDbPackage]) {
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
				const title = (localPackage.title || 'default').replace(/[\/\?<>\\:\*\|":]/g, '');
				await this.setPackageInstallDir([
					localPackage,
					path.join(
						Settings.get('game-install-dir'),
						`${localGame.slug}-${localGame.id}`,
						`${title}-${packageId}`
					),
				]);
			}

			// This is a very specific edge case.
			// Normally when you pause an installation/update, the joltron process hangs around.
			// This allows us to resume it easily with the installerResume function that simply
			// sends the existing process a resume message and continue with its existing promise chain.
			// However, if the operation was paused and the client was closed, when the user boots the client
			// back up again it'll attempt to retry all the installations that were in progress automatically
			// by calling installerRetry, which will end up calling this method.
			// Issue is that the package status will still be paused from the previous run so we need to
			// flick it back to resumed before continuing.
			if (localPackage.isPatchPaused) {
				await this.setPackagePatchResumed(localPackage);
			}

			const patchInstance = await Patcher.patch(localPackage as any, authTokenGetter, {
				authToken,
			});
			const canceled = await new Promise<boolean>((resolve, reject) => {
				this.setCurrentlyPatching([localPackage, patchInstance]);

				const listeners: Partial<PatchEvents> = {};
				const cleanupListeners = () => {
					// Remove all listeners we bound to patch instance so it won't update the
					// local package after the operation is done.
					// This addresses a race condition where we might receive a message from joltron
					// while trying to remove the package model from indexeddb. reciving a message
					// will attempt to update the localdb model but since updates are basically upserts
					// it might re-add a package we just removed!
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
										this.setPackageInstallState([
											localPackage,
											LocalDbPackagePatchState.DOWNLOADING,
										]);
									} else if (localPackage.update_state) {
										this.setPackageUpdateState([
											localPackage,
											LocalDbPackagePatchState.DOWNLOADING,
										]);
									}
									break;

								case PatcherState.Patching:
									// No longer needed.
									this.setPackageDownloadProgress([localPackage, null]);

									if (localPackage.install_state) {
										this.setPackageInstallState([
											localPackage,
											LocalDbPackagePatchState.UNPACKING,
										]);
									} else if (localPackage.update_state) {
										this.setPackageUpdateState([
											localPackage,
											LocalDbPackagePatchState.UNPACKING,
										]);
									}
									break;
							}
						})
					)
					.on(
						'progress',
						(listeners.progress = progress => {
							const progressType = progress.type;

							const newProgress: LocalDbPackageProgress = {
								// Newer version of client voodoo return progress as an integer between 0-100,
								// but old client-voodoo returned a float between 0-1.
								// To maintain compatibility, make this function return the float always.
								progress: progress.percent / 100,

								timeLeft: Math.round(
									(progress.total - progress.current) /
										(progress.sample ? progress.sample.movingAverage : 1)
								),

								// divide by 1024 to convert to kbps
								rate: progress.sample
									? Math.round(progress.sample.movingAverage / 1024)
									: 0,
							};

							if (progressType === 'download') {
								this.setPackageDownloadProgress([localPackage, newProgress]);
							} else {
								this.setPackageUnpackProgress([localPackage, newProgress]);
							}
						})
					)
					.on(
						'paused',
						(listeners.paused = queued => {
							console.log(
								'Pause received in gamejolt repo. From queue: ' +
									(queued ? 'yes' : 'no')
							);

							if (queued) {
								this.setPackagePatchQueued(localPackage);
							} else {
								this.setPackagePatchPaused(localPackage);
							}
						})
					)
					.on(
						'resumed',
						(listeners.resumed = unqueued => {
							console.log(
								'Resume received in gamejolt repo. From queue: ' +
									(unqueued ? 'yes' : 'no')
							);

							if (unqueued) {
								this.setPackagePatchUnqueued(localPackage);
							} else {
								this.setPackagePatchResumed(localPackage);
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

							console.log(
								'Received fatal error in patcher in gamejolt repo: ' + err.message
							);
							reject(err);
						})
					);
			});

			this.unsetCurrentlyPatching(localPackage);

			if (!canceled) {
				if (localPackage.install_state) {
					await this.clearPackageOperations(localPackage);
				} else if (localPackage.update_state) {
					await this.setPackageUpdateComplete(localPackage);
				}

				const action =
					operation === 'install'
						? 'finished installing'
						: 'updated to the latest version';
				const title = operation === 'install' ? 'Game Installed' : 'Game Updated';
				Growls.success({ title, message: `${packageTitle} has ${action}.`, system: true });
			} else {
				console.log('installerInstall: Handling canceled installation');
				// If we were cancelling the first installation - we have to treat the package as uninstalled.
				// By this point we can assume joltron has removed it from disk.
				if (operation === 'install') {
					console.log(
						'installerInstall: This is a first installation. Marking as uninstalled from db with packageUninstall(true)'
					);

					// Calling uninstall normally attempts to spawn a client voodoo uninstall instance.
					// Override that because the uninstallation should be done automatically by the installation process.
					await this.packageUninstall([localPackage, true]);
				} else {
					console.log(
						'installerInstall: This is an update operation. Attempting to rollback with installerRollback'
					);
					try {
						await this.installerRollback(localPackage);
						Growls.success({
							title: 'Update Aborted',
							message: `${packageTitle} aborted the update.`,
							system: true,
						});
					} catch (err) {
						if (localPackage.update_state === LocalDbPackagePatchState.UNPACKING) {
							await this.setPackageUpdateState([
								localPackage,
								LocalDbPackagePatchState.UNPACK_FAILED,
							]);
						} else {
							await this.setPackageUpdateState([
								localPackage,
								LocalDbPackagePatchState.DOWNLOAD_FAILED,
							]);
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
				if (localPackage.install_state === LocalDbPackagePatchState.UNPACKING) {
					await this.setPackageInstallState([
						localPackage,
						LocalDbPackagePatchState.UNPACK_FAILED,
					]);
				} else {
					await this.setPackageInstallState([
						localPackage,
						LocalDbPackagePatchState.DOWNLOAD_FAILED,
					]);
				}
			} else if (localPackage.update_state) {
				if (localPackage.update_state === LocalDbPackagePatchState.UNPACKING) {
					await this.setPackageUpdateState([
						localPackage,
						LocalDbPackagePatchState.UNPACK_FAILED,
					]);
				} else {
					await this.setPackageUpdateState([
						localPackage,
						LocalDbPackagePatchState.DOWNLOAD_FAILED,
					]);
				}
			}

			this.unsetCurrentlyPatching(localPackage);
		}
	}

	@VuexAction
	installerPause(localPackage: Actions['clientLibrary/installerPause']) {
		const patchInstance = this.currentlyPatching[localPackage.id];
		if (!patchInstance) {
			throw new Error('Package is not installing.');
		}

		return patchInstance.pause();
	}

	@VuexAction
	async installerResume(localPackage: Actions['clientLibrary/installerResume']) {
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
	private async installerCancel(localPackage: LocalDbPackage) {
		console.log('installerCancel: executed for package ' + localPackage.id);
		const patchInstance = this.currentlyPatching[localPackage.id];
		if (!patchInstance) {
			console.log('installerCancel: no currently running installation/updates for package');
			return false;
		}

		console.log('installerCancel: found running installation/update. sending cancel');
		await patchInstance.cancel(true);
		console.log('installerCancel: cancel sent');
		return true;
	}

	@VuexAction
	private async installerRollback(localPackage: LocalDbPackage) {
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

		await this.clearPackageOperations(localPackage);
	}

	@VuexAction
	private async doUninstall(localPackage: LocalDbPackage) {
		try {
			const uninstallInstance = await Uninstaller.uninstall(localPackage as any);
			return new Promise<void>((resolve, reject) => {
				uninstallInstance
					.on('uninstallFinished', () => resolve())
					.on('uninstallFailed', reject)
					.on('fatal', reject);
			});
		} catch (err) {
			console.error(err);
			throw err;
		}
	}

	@VuexAction
	private async launcherInit() {
		const pidDir = path.resolve(nw.App.dataPath, 'game-pids');
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

			// For all the packages that have a game pid file and aren't marked as running in the
			// localdb - mark as running before attaching. This will mark them as running using the
			// old client launcher's running format.
			for (const runningPackageId of runningPackageIds) {
				const localPackage = this.packagesById[runningPackageId];
				if (localPackage && !localPackage.isRunning) {
					try {
						await this.setPackageRunningPid([
							localPackage,
							{ wrapperId: localPackage.id.toString() },
						]);
					} catch (e) {
						console.warn(`Could not mark package as running: ${localPackage.id}`);
						console.warn(e);
					}
				}
			}

			// Reattach all running games after a restart.
			for (const localPackage of this.packages) {
				if (localPackage.isRunning) {
					try {
						await this.launcherReattach(localPackage);
					} catch (e) {
						console.warn(e);
					}
				}
			}

			// We only mark the launcher as loaded once it at least finished reattaching to the
			// currently running instances.
			console.log('Launcher loaded and ready');

			this.setLauncherReady(true);
		} catch (err) {
			console.error('Failed to initialize everything for launcher');
			console.error(err);
			this.setLauncherReady(true);
		}
	}

	@VuexMutation
	private setLauncherReady(ready: boolean) {
		this.isLauncherReady = ready;
	}

	@VuexMutation
	private setCurrentlyPlaying(localPackage: LocalDbPackage) {
		this.currentlyPlaying.push(localPackage);
	}

	@VuexMutation
	private unsetCurrentlyPlaying(localPackage: LocalDbPackage) {
		arrayRemove(this.currentlyPlaying, i => localPackage.id === i.id);
	}

	@VuexAction
	async launcherLaunch(localPackage: Actions['clientLibrary/launcherLaunch']) {
		try {
			await this.setPackageLaunching(localPackage);

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
	private async launcherReattach(localPackage: LocalDbPackage) {
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
	private async launcherAttach(
		[localPackage, launchInstance]: [LocalDbPackage, LaunchInstance | OldLaunchInstance]
	) {
		this.setCurrentlyPlaying(localPackage);

		// Typescript for some reason can't detect that all possible types of launchInstance have a .on( 'gameOver' ), so we have to assert type.
		if (launchInstance instanceof LaunchInstance) {
			launchInstance.on('gameOver', () => this.launcherClear(localPackage));
		} else {
			launchInstance.on('gameOver', () => this.launcherClear(localPackage));
		}

		await this.setPackageRunningPid([localPackage, launchInstance.pid]);
	}

	@VuexAction
	private async launcherClear(localPackage: LocalDbPackage) {
		this.unsetCurrentlyPlaying(localPackage);
		await this.clearPackageRunningPid(localPackage);
	}

	@VuexAction
	private async syncCheck() {
		console.log('Syncing library.');

		const builds = this.packages.map(i => i.build);

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
		for (const localGame of this.games) {
			request.games[localGame.id] = localGame.modified_on || 0;
		}

		for (const build of builds) {
			request.builds[build.id] = build.modified_on || 0;
		}

		type ApiResponse = {
			games: any[] | undefined;
			builds: any[] | undefined;
			updateBuilds: any[] | undefined;
		};

		const response = (await Api.sendRequest('/web/client/sync', request, {
			detach: true,

			// If we allowed it to sanitize, it would filter out arrays in the request.
			sanitizeComplexData: false,
		})) as ApiResponse;

		// Important! Don't the whole thing if any of these fail.
		if (response.games) {
			for (const gameData of response.games) {
				try {
					await this.syncGame([gameData.id, gameData]);
				} catch (e) {
					console.error(e);
				}
			}
		}

		if (response.builds) {
			for (const buildData of response.builds) {
				try {
					await this.syncPackage([buildData.game_package_id, response]);
				} catch (e) {
					console.error(e);
				}
			}
		}

		if (response.updateBuilds) {
			for (const data of response.updateBuilds) {
				const packageId = data.packageId as number;
				const newBuildId = data.newBuildId as number;

				try {
					const localPackage = this.packagesById[packageId];
					if (!localPackage) {
						throw new Error('Tried updating package not set in localdb.');
					}

					await this.packageStartUpdate([localPackage, newBuildId]);
				} catch (e) {
					console.error(e);
				}
			}
		}
	}

	@VuexAction
	private async syncGame([gameId, data]: [number, any]) {
		const localGame = this.gamesById[gameId];
		if (!localGame) {
			throw new Error('Game is not set in localdb.');
		}

		await this.setGameData([localGame, data]);
	}

	@VuexAction
	private async syncPackage([packageId, data]: [number, any]) {
		const localPackage = this.packagesById[packageId];
		if (!localPackage) {
			throw new Error('Game is not set in localdb.');
		}

		const pkg = (data.packages as GamePackage[]).find(a => a.id === localPackage.id);
		const release = (data.releases as GameRelease[]).find(
			a => a.id === localPackage.release.id
		);
		const build = (data.builds as GameBuild[]).find(a => a.id === localPackage.build.id);
		const launchOptions = (data.launchOptions as GameBuildLaunchOption[]).filter(
			a => a.game_build_id === localPackage.build.id
		);

		// If those are not set then this package is not even valid.
		if (!pkg || !release || !build) {
			throw new Error(
				`Package ${localPackage.id} is no longer valid. ` +
					`The payload did not contain the package, it's release (${
						localPackage.release.id
					})` +
					` or it's build (${localPackage.build.id})`
			);
		}

		await this.setPackageData([
			localPackage,
			LocalDbPackage.fromSitePackageInfo(pkg, release, build, launchOptions),
		]);
	}

	@VuexAction
	private async setGameData([localGame, data]: [LocalDbGame, Partial<LocalDbGame>]) {
		this._setGameData([localGame, data]);

		const dbId = await db.games.put(localGame);

		if (!this.gamesById[localGame.id]) {
			this.games.push(localGame);
		}

		return dbId;
	}

	@VuexMutation
	private _setGameData([localGame, data]: [LocalDbGame, Partial<LocalDbGame>]) {
		localGame.set(data);
	}

	@VuexAction
	async packageInstall(
		[game, pkg, release, build, launchOptions]: Actions['clientLibrary/packageInstall']
	) {
		// TODO: Are these needed?
		HistoryTick.sendBeacon('game-build', build.id, {
			sourceResource: 'Game',
			sourceResourceId: game.id,
		});
		HistoryTick.sendBeacon('game-build-install', build.id, {
			sourceResource: 'Game',
			sourceResourceId: game.id,
		});

		const localGame = new LocalDbGame();
		const localPackage = new LocalDbPackage();

		await db.transaction('rw', [db.games, db.packages], async () => {
			await this.setGameData([localGame, game]);
			await this.setPackageData([
				localPackage,
				{
					...LocalDbPackage.fromSitePackageInfo(pkg, release, build, launchOptions),
					install_state: LocalDbPackagePatchState.PATCH_PENDING,
				},
			]);
		});

		return this.doPatch([localGame, localPackage]);
	}

	@VuexAction
	async packageStartUpdate(
		[localPackage, newBuildId]: Actions['clientLibrary/packageStartUpdate']
	) {
		// If this package isn't installed (and at rest), we don't update.
		// We also don't update if we're currently running the game. Imagine that happening!
		if (!localPackage.isSettled || localPackage.isRunning) {
			return false;
		}

		const response = await Api.sendRequest(
			`/web/client/get-build-for-update/${newBuildId}`,
			null,
			{
				detach: true,
			}
		);

		if (!response || !response.package) {
			return false;
		}

		// We store the new data from the site into update data so we can pull it into the localdb
		// package model after the update finishes.
		const updateData = new LocalDbPackage();

		// Don't put into localdb. Just call set manually to set the fields.
		updateData.set(
			LocalDbPackage.fromSitePackageInfo(
				response.package,
				response.release,
				response.build,
				response.launchOptions
			)
		);
		updateData.install_dir = localPackage.install_dir;

		await this.setPackageUpdateData([localPackage, updateData]);
		await this.setPackageUpdateState([localPackage, LocalDbPackagePatchState.PATCH_PENDING]);

		const game = this.gamesById[localPackage.game_id];
		this.doPatch([game, localPackage]);

		return true;
	}

	@VuexAction
	async packageUninstall([localPackage, dbOnly]: Actions['clientLibrary/packageUninstall']) {
		// We just use this so they don't click "uninstall" twice in a row.
		// No need to save to the DB.
		let currentlyUninstalling = this.currentlyUninstalling[localPackage.id];
		if (currentlyUninstalling) {
			console.log(
				'packageUninstall: already handling an uninstallation for this package. noop.'
			);
			return currentlyUninstalling;
		}

		// Optimally the entire uninstalling promise would run in a single indexeddb transaction,
		// but dexie has an issue with keeping a transaction alive for the duration: http://dexie.org/docs/Dexie/Dexie.transaction().html
		// Basically if there is a node tick that doesn't 'use' or 'wait on' an indexeddb transaction operation the transaction auto commits,
		// so we can't do things like asyncronously waiting on filesystem. Therefore we had to split the transaction into chunks.
		currentlyUninstalling = (async () => {
			// Are we removing a FIRST install?
			const wasInstalling = localPackage.isInstalling;

			let localGame: LocalDbGame | undefined;

			try {
				// When canceling a first installation it will end up calling packageUninstall
				// with dbOnly set to true. In this case joltron will uninstall the package on its own,
				// so all we need to do here is clean the package and game if necessary from the indexeddb.
				// So we only attempt to do installerCancel (which interacts with joltron) if its NOT
				// a first installation cancellation (dbOnly would be false)
				if (!dbOnly) {
					// if no installation or update is currently in progress this will return false immediately,
					// otherwise it'll await until the cancel message is SENT.
					// it won't wait for the cancel to be acknowledged and processed,
					// when the cancel is processed by the installerInstall promise chain,
					// it'll result in a second call to packageUninstall this time with dbOnly set to true if its
					// a first installation, or a rollback operation for update operations.
					// Either way this means we shouldn't continue this uninstallation promise chain.
					const interruptedPatch = await this.installerCancel(localPackage);
					if (interruptedPatch) {
						// We unset the uninstallation because otherwise the second time we call packageUninstall
						// (for first installations) it'll be a noop instead of actually cleaning the package
						// from localdb. In case of rollback its not really an uninstallation state either.
						this.unsetCurrentlyUninstalling(localPackage);
						return;
					}
				}

				// We refetch from db because if canceling a first installation it might remove the local game from the db.
				localGame = await db.games.get(localPackage.game_id);

				// Make sure we're clean.
				await this.clearPackageOperations(localPackage);
				await this.setPackageRemoveState([
					localPackage,
					LocalDbPackageRemoveState.REMOVING,
				]);

				// Skip removing the package if we don't want to actually uninstall from disk.
				if (!dbOnly) {
					await this.doUninstall(localPackage);
				}

				// Get the number of packages in this game.
				const count = await db.packages
					.where('game_id')
					.equals(localPackage.game_id)
					.count();

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
					Growls.success({
						title: 'Package Removed',
						message:
							'Removed ' +
							(localPackage.title || (localGame ? localGame.title : 'the package')) +
							' from your computer.',
						system: true,
					});
				} else {
					Growls.success({
						title: 'Installation Canceled',
						message:
							'Canceled installation of ' +
							(localPackage.title || (localGame ? localGame.title : 'the package')),
						system: true,
					});
				}
			} catch (err) {
				if (wasInstalling) {
					Growls.error('Could not stop the installation.');
				} else {
					Growls.error({
						title: 'Remove Failed',
						message:
							'Could not remove ' +
							(localPackage.title || (localGame ? localGame.title : 'the package')) +
							'.',
						system: true,
					});
				}

				await this.setPackageRemoveState([
					localPackage,
					LocalDbPackageRemoveState.REMOVE_FAILED,
				]);
			} finally {
				this.unsetCurrentlyUninstalling(localPackage);
			}
		})();

		this.setCurrentlyUninstalling([localPackage, currentlyUninstalling]);
		return currentlyUninstalling;
	}

	@VuexAction
	async setPackageInstallDir([localPackage, dir]: [LocalDbPackage, string]) {
		await this.setPackageData([localPackage, { install_dir: dir }]);
	}

	@VuexAction
	async setPackageInstallState(
		[localPackage, state]: [LocalDbPackage, LocalDbPackagePatchState]
	) {
		await this.setPackageData([localPackage, { install_state: state }]);
	}

	@VuexAction
	async setPackagePatchPaused(localPackage: LocalDbPackage) {
		await this.setPackageData([localPackage, { patch_paused: true }]);
	}

	@VuexAction
	async setPackagePatchResumed(localPackage: LocalDbPackage) {
		await this.setPackageData([localPackage, { patch_paused: false }]);
	}

	@VuexAction
	async setPackagePatchQueued(localPackage: LocalDbPackage) {
		await this.setPackageData([localPackage, { patch_queued: true }]);
	}

	@VuexAction
	async setPackagePatchUnqueued(localPackage: LocalDbPackage) {
		await this.setPackageData([localPackage, { patch_queued: false }]);
	}

	@VuexAction
	async setPackageUpdateData([localPackage, update]: [LocalDbPackage, LocalDbPackage]) {
		await this.setPackageData([localPackage, { update }]);
	}

	@VuexAction
	async setPackageUpdateState([localPackage, state]: [LocalDbPackage, LocalDbPackagePatchState]) {
		await this.setPackageData([localPackage, { update_state: state }]);
	}

	@VuexAction
	async setPackageUpdateComplete(localPackage: LocalDbPackage) {
		// The new data that we need to put on the package is in the "update" property of the local
		// package.
		if (!localPackage.update) {
			throw new Error('Update package does not exist');
		}

		const update = localPackage.update;
		if (!update.install_dir) {
			update.install_dir = localPackage.install_dir;
		}

		await this.clearPackageOperations(localPackage);

		await this.setPackageData([
			localPackage,
			{
				// It's a localdb package, so it should have all the correct fields.
				...update,
			},
		]);
	}

	@VuexAction
	async setPackageDownloadProgress(
		[localPackage, progress]: [LocalDbPackage, LocalDbPackageProgress | null]
	) {
		await this.setPackageData([localPackage, { download_progress: progress }]);
	}

	@VuexAction
	async setPackageUnpackProgress(
		[localPackage, progress]: [LocalDbPackage, LocalDbPackageProgress | null]
	) {
		await this.setPackageData([localPackage, { unpack_progress: progress }]);
	}

	/**
	 * Clears any state information contained in the package to a clean slate. Can be used after
	 * operations complete or fail.
	 */
	@VuexAction
	async clearPackageOperations(localPackage: LocalDbPackage) {
		await this.setPackageData([
			localPackage,
			{
				update: null,
				install_state: null,
				update_state: null,
				remove_state: null,
				run_state: null,
				download_progress: null,
				unpack_progress: null,
				patch_paused: null,
				patch_queued: null,
				running_pid: null,
			},
		]);
	}

	@VuexAction
	async setPackageLaunching(localPackage: LocalDbPackage) {
		await this.setPackageData([localPackage, { run_state: LocalDbPackageRunState.LAUNCHING }]);
	}

	@VuexAction
	async setPackageRunningPid([localPackage, pid]: [LocalDbPackage, LocalDbPackagePid]) {
		await this.setPackageData([
			localPackage,
			{
				run_state: LocalDbPackageRunState.RUNNING,
				running_pid: pid,
			},
		]);
	}

	@VuexAction
	async clearPackageRunningPid(localPackage: LocalDbPackage) {
		await this.setPackageData([
			localPackage,
			{
				run_state: null,
				running_pid: null,
			},
		]);
	}

	@VuexAction
	async setPackageRemoveState(
		[localPackage, state]: [LocalDbPackage, LocalDbPackageRemoveState]
	) {
		await this.setPackageData([localPackage, { remove_state: state }]);
	}

	@VuexAction
	private async setPackageData([localPackage, data]: [LocalDbPackage, Partial<LocalDbPackage>]) {
		this._setPackageData([localPackage, data]);

		const dbId = await db.packages.put(localPackage);

		if (!this.packagesById[localPackage.id]) {
			this.packages.push(localPackage);
		}

		return dbId;
	}

	@VuexMutation
	private _setPackageData([localPackage, data]: [LocalDbPackage, Partial<LocalDbPackage>]) {
		localPackage.set(data);
	}
}
