import type { PatchEvents, PatchInstance } from 'client-voodoo';
import { ComputedRef, markRaw, reactive, Ref } from 'vue';
import { Api } from '../../../_common/api/api.service';
import {
	Patcher,
	Rollbacker,
	State as PatcherState,
	Uninstaller,
} from '../../../_common/client/client-voodoo-imports';
import type { GameBuild } from '../../../_common/game/build/build.model';
import type { GameBuildLaunchOption } from '../../../_common/game/build/launch-option/launch-option.model';
import type { Game } from '../../../_common/game/game.model';
import type { GamePackage } from '../../../_common/game/package/package.model';
import type { GameRelease } from '../../../_common/game/release/release.model';
import { showSuccessGrowl } from '../../../_common/growls/growls.service';
import { HistoryTick } from '../../../_common/history-tick/history-tick-service';
import { SettingGameInstallDir } from '../../../_common/settings/settings.service';
import { $gettext, $gettextInterpolate } from '../../../_common/translate/translate.service';
import { LocalDbGame } from '../../components/client/local-db/game/game.model';
import { LocalDb } from '../../components/client/local-db/local-db.service';
import type { LocalDbPackageProgress } from '../../components/client/local-db/package/package.model';
import {
	LocalDbPackage,
	LocalDbPackagePatchState,
	LocalDbPackageRemoveState,
} from '../../components/client/local-db/package/package.model';
import type { ClientVoodooOperation } from './client-voodoo';
import { handleClientVoodooError, trackClientVoodooOperation } from './client-voodoo';
import type ClientLibraryGameDataMutations from './game-data-mutations';
import type ClientLibraryPackageDataMutations from './package-data-mutations';

const path = require('path') as typeof import('path');

export default class ClientLibraryPackageInstallOperations {
	constructor(
		private readonly _getDb: () => Promise<LocalDb>,
		private readonly currentlyPatching: Ref<{ [packageId: number]: PatchInstance | undefined }>,
		private readonly currentlyUninstalling: Ref<{
			[packageId: number]: Promise<void> | undefined;
		}>,
		private readonly gamesById: ComputedRef<{ [id: number]: LocalDbGame | undefined }>,
		private readonly gameDataOps: ClientLibraryGameDataMutations,
		private readonly pkgDataOps: ClientLibraryPackageDataMutations
	) {}

	async packageInstall(
		game: Game,
		pkg: GamePackage,
		release: GameRelease,
		build: GameBuild,
		launchOptions: GameBuildLaunchOption[]
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

		const localGame = reactive(new LocalDbGame()) as LocalDbGame;
		const localPackage = reactive(new LocalDbPackage()) as LocalDbPackage;

		await this.gameDataOps.setGameData(localGame, game);
		await this.pkgDataOps.setPackageData(localPackage, {
			...LocalDbPackage.fromSitePackageInfo(pkg, release, build, launchOptions),
			install_state: LocalDbPackagePatchState.PATCH_PENDING,
		});

		return this._doPatch(localGame, localPackage);
	}

	async packageUpdate(localPackage: LocalDbPackage, newBuildId: number) {
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

		await this.pkgDataOps.setPackageUpdateData(localPackage, updateData);
		await this.pkgDataOps.setPackageUpdateState(
			localPackage,
			LocalDbPackagePatchState.PATCH_PENDING
		);

		const game = this.gamesById.value[localPackage.game_id]!;
		this._doPatch(game, localPackage);

		return true;
	}

	async packageUninstall(
		localPackage: LocalDbPackage,
		options?: Partial<{ dbOnly: boolean; notifications: boolean }>
	) {
		const dbOnly = options?.dbOnly ?? false;
		const withNotifications = options?.notifications ?? true;

		// We just use this so they don't click "uninstall" twice in a row.
		// No need to save to the DB.
		let currentlyUninstallingPkg = this.currentlyUninstalling.value[localPackage.id] ?? null;
		if (currentlyUninstallingPkg) {
			console.log(
				'packageUninstall: already handling an uninstallation for this package. noop.'
			);
			return currentlyUninstallingPkg;
		}

		// Optimally the entire uninstalling promise would run in a single indexeddb transaction,
		// but dexie has an issue with keeping a transaction alive for the duration: http://dexie.org/docs/Dexie/Dexie.transaction().html
		// Basically if there is a node tick that doesn't 'use' or 'wait on' an indexeddb transaction operation the transaction auto commits,
		// so we can't do things like asyncronously waiting on filesystem. Therefore we had to split the transaction into chunks.
		currentlyUninstallingPkg = (async () => {
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
						delete this.currentlyUninstalling.value[localPackage.id];
						return;
					}
				}

				// We refetch from db because if canceling a first installation it might remove the local game from the db.
				const dbInst = await this._getDb();
				localGame = dbInst.games.get(localPackage.game_id)!;

				const packageTitle =
					localPackage.title || (localGame ? localGame.title : 'the package');

				// Make sure we're clean.
				await this.pkgDataOps.clearPackageOperations(localPackage);
				await this.pkgDataOps.setPackageRemoveState(
					localPackage,
					LocalDbPackageRemoveState.REMOVING
				);

				// Skip removing the package if we don't want to actually uninstall from disk.
				if (!dbOnly) {
					console.log('doing uninstall');
					await this.doUninstall(
						localPackage,
						packageTitle,
						withNotifications,
						wasInstalling
					);
					console.log('uninstall done');
				}

				console.log('unsetting package');

				// This will also unset the game if it was the last package.
				await this.pkgDataOps.unsetPackage(localPackage);

				if (withNotifications) {
					if (!wasInstalling) {
						showSuccessGrowl({
							title: 'Package Removed',
							message:
								'Removed ' +
								(localPackage.title ||
									(localGame ? localGame.title : 'the package')) +
								' from your computer.',
							system: true,
						});
					} else {
						showSuccessGrowl({
							title: 'Installation Canceled',
							message:
								'Canceled installation of ' +
								(localPackage.title ||
									(localGame ? localGame.title : 'the package')),
							system: true,
						});
					}
				}
			} catch (err) {
				console.error(err);
				await this.pkgDataOps.setPackageRemoveState(
					localPackage,
					LocalDbPackageRemoveState.REMOVE_FAILED
				);
			} finally {
				console.log('deleting from currentlyUninstalling');
				delete this.currentlyUninstalling.value[localPackage.id];
			}
		})();

		this.currentlyUninstalling.value[localPackage.id] = currentlyUninstallingPkg;
		return currentlyUninstallingPkg;
	}

	async _doPatch(localGame: LocalDbGame, localPackage: LocalDbPackage) {
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

		let patchBegun = false;

		try {
			// We freeze the installation directory in time.
			if (!localPackage.install_dir) {
				const title = (localPackage.title || 'default').replace(/[/?<>\\:*|":]/g, '');
				await this.pkgDataOps.setPackageInstallDir(
					localPackage,
					path.join(
						SettingGameInstallDir.get(),
						`${localGame.slug}-${localGame.id}`,
						`${title}-${packageId}`
					)
				);
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
				await this.pkgDataOps.setPackagePatchResumed(localPackage);
			}

			const patchInstance = markRaw(
				await Patcher.patch(localPackage as any, authTokenGetter, {
					authToken,
				})
			);

			patchBegun = true;
			trackClientVoodooOperation(
				operation === 'install' ? 'install-begin' : 'update-begin',
				true
			);

			const canceled = await new Promise<boolean>((resolve, reject) => {
				this.currentlyPatching.value[localPackage.id] = patchInstance;

				const listeners: Partial<PatchEvents> = {};
				const cleanupListeners = () => {
					// Remove all listeners we bound to patch instance so it won't update the
					// local package after the operation is done.
					// This addresses a race condition where we might receive a message from joltron
					// while trying to remove the package model from indexeddb. reciving a message
					// will attempt to update the localdb model but since updates are basically upserts
					// it might re-add a package we just removed!
					for (const i_event in listeners) {
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
										this.pkgDataOps.setPackageInstallState(
											localPackage,
											LocalDbPackagePatchState.DOWNLOADING
										);
									} else if (localPackage.update_state) {
										this.pkgDataOps.setPackageUpdateState(
											localPackage,
											LocalDbPackagePatchState.DOWNLOADING
										);
									}
									break;

								case PatcherState.Patching:
									// No longer needed.
									this.pkgDataOps.setPackageDownloadProgress(localPackage, null);

									if (localPackage.install_state) {
										this.pkgDataOps.setPackageInstallState(
											localPackage,
											LocalDbPackagePatchState.UNPACKING
										);
									} else if (localPackage.update_state) {
										this.pkgDataOps.setPackageUpdateState(
											localPackage,
											LocalDbPackagePatchState.UNPACKING
										);
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
								this.pkgDataOps.setPackageDownloadProgress(
									localPackage,
									newProgress
								);
							} else {
								this.pkgDataOps.setPackageUnpackProgress(localPackage, newProgress);
							}
						})
					)
					.on(
						'paused',
						(listeners.paused = queued => {
							console.log(
								'Handling client-voodoo paused event. From queue: ' +
									(queued ? 'yes' : 'no')
							);

							if (queued) {
								this.pkgDataOps.setPackagePatchQueued(localPackage);
							} else {
								this.pkgDataOps.setPackagePatchPaused(localPackage);
							}
						})
					)
					.on(
						'resumed',
						(listeners.resumed = unqueued => {
							console.log(
								'Hnadling client-voodoo resumed event. From queue: ' +
									(unqueued ? 'yes' : 'no')
							);

							if (unqueued) {
								this.pkgDataOps.setPackagePatchUnqueued(localPackage);
							} else {
								this.pkgDataOps.setPackagePatchResumed(localPackage);
							}
						})
					)
					.on(
						'updateFailed',
						(listeners.updateFailed = reason => {
							console.log(
								'Handling client-voodoo updateFailed event with reason: ' + reason
							);

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
							console.log('Handling client-voodoo updateFinished event');
							cleanupListeners();
							resolve(false);
						})
					)
					.on(
						'fatal',
						(listeners.fatal = err => {
							console.log(
								'Handling client-voodoo fatal event with err: ' + err.message
							);

							cleanupListeners();
							reject(err);
						})
					);
			});

			delete this.currentlyPatching.value[localPackage.id];

			// Even if our patch operation has been canceled - as far as the installation flow is concerned it was a success.
			trackClientVoodooOperation(
				operation === 'install' ? 'install-end' : 'update-end',
				true
			);

			if (!canceled) {
				if (localPackage.install_state) {
					await this.pkgDataOps.clearPackageOperations(localPackage);
				} else if (localPackage.update_state) {
					await this.pkgDataOps.setPackageUpdateComplete(localPackage);
				}

				const action =
					operation === 'install'
						? 'finished installing'
						: 'updated to the latest version';
				const title = operation === 'install' ? 'Game Installed' : 'Game Updated';
				showSuccessGrowl({
					title,
					message: `${packageTitle} has ${action}.`,
					system: true,
				});
			} else {
				console.log('installerInstall: Handling canceled installation');
				// If we were cancelling the first installation - we have to treat the package as uninstalled.
				// By this point we can assume joltron has removed it from disk.
				if (operation === 'install') {
					// Since the actual aborting is done by joltron for first installations we don't
					// really have a hook to use for sending the patch-abort-begin/end analytics. This is a best effort.
					trackClientVoodooOperation('patch-abort-begin', true);
					trackClientVoodooOperation('patch-abort-end', true);

					console.log(
						'installerInstall: This is a first installation. Marking as uninstalled from db with packageUninstall(true)'
					);

					// Calling uninstall normally attempts to spawn a client voodoo uninstall instance.
					// Override that because the uninstallation should be done automatically by the installation process.
					await this.packageUninstall(localPackage, {
						dbOnly: true,
						notifications: true,
					});
				} else {
					console.log(
						'installerInstall: This is an update operation. Attempting to rollback with installerRollback'
					);
					try {
						await this.installerRollback(localPackage, packageTitle);
						showSuccessGrowl({
							title: 'Update Aborted',
							message: `${packageTitle} aborted the update.`,
							system: true,
						});
					} catch (err) {
						if (localPackage.update_state === LocalDbPackagePatchState.UNPACKING) {
							await this.pkgDataOps.setPackageUpdateState(
								localPackage,
								LocalDbPackagePatchState.UNPACK_FAILED
							);
						} else {
							await this.pkgDataOps.setPackageUpdateState(
								localPackage,
								LocalDbPackagePatchState.DOWNLOAD_FAILED
							);
						}
					}
				}
			}
		} catch (err) {
			console.error(err);

			const title =
				operation === 'install'
					? $gettext(`Installation Failed`)
					: $gettext(`Update Failed`);

			const message =
				operation === 'install'
					? $gettextInterpolate(`%{package} failed to install.`, {
							package: packageTitle,
					  })
					: $gettextInterpolate(`%{package} failed to update.`, {
							package: packageTitle,
					  });

			let cvOperation: ClientVoodooOperation;
			if (operation === 'install') {
				cvOperation = patchBegun ? 'install-end' : 'install-begin';
			} else {
				cvOperation = patchBegun ? 'update-end' : 'update-begin';
			}

			handleClientVoodooError(err, cvOperation, message, title);

			if (localPackage.install_state) {
				if (localPackage.install_state === LocalDbPackagePatchState.UNPACKING) {
					await this.pkgDataOps.setPackageInstallState(
						localPackage,
						LocalDbPackagePatchState.UNPACK_FAILED
					);
				} else {
					await this.pkgDataOps.setPackageInstallState(
						localPackage,
						LocalDbPackagePatchState.DOWNLOAD_FAILED
					);
				}
			} else if (localPackage.update_state) {
				if (localPackage.update_state === LocalDbPackagePatchState.UNPACKING) {
					await this.pkgDataOps.setPackageUpdateState(
						localPackage,
						LocalDbPackagePatchState.UNPACK_FAILED
					);
				} else {
					await this.pkgDataOps.setPackageUpdateState(
						localPackage,
						LocalDbPackagePatchState.DOWNLOAD_FAILED
					);
				}
			}

			delete this.currentlyPatching.value[localPackage.id];
		}
	}

	async doUninstall(
		localPackage: LocalDbPackage,
		packageTitle: string,
		withNotifications: boolean,
		wasInstalling: boolean
	) {
		let uninstallBegun = false;

		try {
			const uninstallInstance = markRaw(await Uninstaller.uninstall(localPackage as any));
			uninstallBegun = true;
			trackClientVoodooOperation('uninstall-begin', true);

			await new Promise<void>((resolve, reject) => {
				uninstallInstance
					.on('uninstallFinished', () => resolve())
					.on('uninstallFailed', reject)
					.on('fatal', reject);
			});

			trackClientVoodooOperation('uninstall-end', true);
		} catch (err) {
			console.error(err);

			const uninstallOp: ClientVoodooOperation = uninstallBegun
				? 'uninstall-end'
				: 'uninstall-begin';

			if (withNotifications) {
				if (wasInstalling) {
					handleClientVoodooError(
						err,
						uninstallOp,
						$gettextInterpolate(
							'Could not stop the installation of %{ packageTitle }.',
							{
								packageTitle,
							}
						)
					);
				} else {
					handleClientVoodooError(
						err,
						uninstallOp,
						$gettextInterpolate('Could not remove %{ packageTitle }.', {
							packageTitle,
						}),
						$gettext('Remove failed')
					);
				}
			} else {
				handleClientVoodooError(err, uninstallOp);
			}

			throw err;
		}
	}

	async installerRetry(localPackage: LocalDbPackage) {
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
				this.pkgDataOps.setPackageInstallState(
					localPackage,
					LocalDbPackagePatchState.PATCH_PENDING
				);
			} else if (unpackStates.indexOf(localPackage.install_state) !== -1) {
				this.pkgDataOps.setPackageInstallState(
					localPackage,
					LocalDbPackagePatchState.DOWNLOADED
				);
			}
		} else if (localPackage.update_state) {
			if (downloadStates.indexOf(localPackage.update_state || '') !== -1) {
				this.pkgDataOps.setPackageUpdateState(
					localPackage,
					LocalDbPackagePatchState.PATCH_PENDING
				);
			} else if (unpackStates.indexOf(localPackage.update_state || '') !== -1) {
				this.pkgDataOps.setPackageUpdateState(
					localPackage,
					LocalDbPackagePatchState.DOWNLOADED
				);
			}
		}

		const game = this.gamesById.value[localPackage.game_id]!;
		return this._doPatch(game, localPackage);
	}

	installerPause(localPackage: LocalDbPackage) {
		const patchInstance = this.currentlyPatching.value[localPackage.id];
		if (!patchInstance) {
			throw new Error('Package is not installing.');
		}

		return patchInstance.pause();
	}

	async installerResume(localPackage: LocalDbPackage) {
		const patchInstance = this.currentlyPatching.value[localPackage.id];
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

	async installerCancel(localPackage: LocalDbPackage) {
		console.log('installerCancel: executed for package ' + localPackage.id);
		const patchInstance = this.currentlyPatching.value[localPackage.id];
		if (!patchInstance) {
			console.log('installerCancel: no currently running installation/updates for package');
			return false;
		}

		console.log('installerCancel: found running installation/update. sending cancel');
		await patchInstance.cancel(true);
		console.log('installerCancel: cancel sent');
		return true;
	}

	async installerRollback(localPackage: LocalDbPackage, packageTitle: string) {
		let abortBegun = false;

		try {
			const rollbackInstance = markRaw(await Rollbacker.rollback(localPackage as any));
			abortBegun = true;
			trackClientVoodooOperation('patch-abort-begin', true);

			await new Promise<void>((resolve, reject) => {
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

			await this.pkgDataOps.clearPackageOperations(localPackage);
			trackClientVoodooOperation('patch-abort-end', true);
		} catch (err) {
			const title = $gettext('Update Failed');
			const message = $gettextInterpolate(
				`%{ packageTitle } cannot abort at this time. Retry or uninstall it.`,
				{ packageTitle }
			);

			handleClientVoodooError(
				err,
				abortBegun ? 'patch-abort-end' : 'patch-abort-begin',
				message,
				title
			);
			throw err;
		}
	}
}
