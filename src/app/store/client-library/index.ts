import type { PatchInstance } from 'client-voodoo';
import { computed, ComputedRef, inject, InjectionKey, Ref, ref } from 'vue';
import { arrayGroupBy, arrayIndexBy, arrayRemove } from '../../../utils/array';
import { fuzzysearch } from '../../../utils/string';
import { HidePrivateKeys } from '../../../utils/utils';
import { ClientUpdater } from '../../../_common/client/client-updater.service';
import { Config, Queue } from '../../../_common/client/client-voodoo-imports';
import {
	SettingMaxDownloadCount,
	SettingMaxExtractCount,
	SettingQueueWhenPlaying,
} from '../../../_common/settings/settings.service';
import { LocalDbGame } from '../../components/client/local-db/game/game.model';
import { LocalDb } from '../../components/client/local-db/local-db.service';
import { LocalDbPackage } from '../../components/client/local-db/package/package.model';
import ClientLibraryGameDataMutations from './game-data-mutations';
import ClientLibraryPackageDataMutations from './package-data-mutations';
import ClientLibraryPackageInstallOperations from './package-install-operations';
import ClientLibraryPackageLaunchOperations from './package-launch-operations';
import ClientLibrarySyncOperations from './sync-operations';

const path = require('path') as typeof import('path');
const fs = require('fs') as typeof import('fs');

type ClientLibraryStoreInternal = ReturnType<typeof createClientLibraryStore>;
export type ClientLibraryStore = HidePrivateKeys<ClientLibraryStoreInternal>;

// function asInternal(store: ClientLibraryStore) {
// 	return store as ClientLibraryStoreInternal;
// }

export const ClientLibraryStoreKey: InjectionKey<ClientLibraryStore> =
	Symbol('client-library-store');

export function useClientLibraryStore() {
	return inject(ClientLibraryStoreKey)!;
}

export function createClientLibraryStore() {
	let _db = null as LocalDb | null;
	let _dbPromise: Promise<LocalDb> | null = null;
	function _getDb() {
		if (_dbPromise) {
			return _dbPromise;
		}

		_dbPromise = LocalDb.instance();
		return _dbPromise;
	}

	const packages = ref([]) as Ref<LocalDbPackage[]>;
	const games = ref([]) as Ref<LocalDbGame[]>;

	async function setPackageData(localPackage: LocalDbPackage, data: Partial<LocalDbPackage>) {
		const db = _db ?? (await _getDb());

		localPackage.set(data);

		const isInsert = db.packages.put(localPackage);
		console.log('set package data. is insert: ' + (isInsert ? 'yes' : 'no'));
		if (isInsert) {
			packages.value.push(localPackage);
		}

		await db.packages.save();
	}

	async function unsetPackage(localPackage: LocalDbPackage) {
		const db = _db ?? (await _getDb());

		// Remove the package from localdb collection and our runtime state.
		console.log('unsetting package (id: ' + localPackage.id + ')');
		console.log(JSON.stringify(packages.value));

		console.log('deleting package from db package collection');
		db.packages.delete(localPackage.id);
		console.log('removing from runtime packages');
		arrayRemove(packages.value, p => p.id == localPackage.id);

		// Get the number of packages left in the game.
		const gameId = localPackage.game_id;
		const packagesLeft = db.packages.countInGroup('game_id', gameId);
		console.log('packages left for game', packagesLeft);

		// Note that some times a game is removed before the package (really weird cases).
		// We still want the remove to go through, so be sure to skip this situation.
		// If this is the last package for the game, remove the game since we no longer need it.
		let gamesNeedSaving;
		if (packagesLeft <= 1) {
			console.log('deleting game from db game collection');
			db.games.delete(gameId);
			console.log('removing from runtime games');
			arrayRemove(games.value, g => g.id == gameId);
			gamesNeedSaving = true;
		} else {
			gamesNeedSaving = false;
		}

		console.log('saving db');
		const saveOps = [db.packages.save()];
		if (gamesNeedSaving) {
			saveOps.push(db.games.save());
		}

		await Promise.all(saveOps);
		console.log('saved db');
	}

	async function setGameData(localGame: LocalDbGame, data: Partial<LocalDbGame>) {
		const db = _db ?? (await _getDb());

		localGame.set(data);

		const isInsert = db.games.put(localGame);
		if (isInsert) {
			games.value.push(localGame);
			// triggerRef(games);
		}

		await db.games.save();
	}

	const packagesById = computed(() => {
		console.log('reevaluating packagesById');
		const myPackages = arrayIndexBy(packages.value, 'id');
		console.log(JSON.stringify(myPackages));
		return myPackages;
	}) as ComputedRef<{
		[packageId: number]: LocalDbPackage | undefined;
	}>;
	const gamesById = computed(() => arrayIndexBy(games.value, 'id')) as ComputedRef<{
		[gameId: number]: LocalDbGame | undefined;
	}>;
	const packagesByGameId = computed(() =>
		arrayGroupBy(packages.value, 'game_id')
	) as ComputedRef<{ [gameId: number]: LocalDbPackage[] | undefined }>;

	// Installer variables
	const currentlyPatching = ref({}) as Ref<{ [packageId: number]: PatchInstance | undefined }>;
	const currentlyUninstalling = ref({}) as Ref<{
		[packageId: number]: Promise<void> | undefined;
	}>;

	const numPatching = computed(() => Object.keys(currentlyPatching.value).length);
	const totalPatchProgress = computed(() => {
		if (!numPatching.value) {
			return null;
		}

		let currentProgress = 0;
		let amount = numPatching.value;
		for (const packageId in currentlyPatching.value) {
			const progress = packagesById.value[packageId]!.patchProgress;

			// If the progress is null, we don't count that package progress as part of the total
			// progress, because it means there was some unexpected error with the stored package.
			if (progress === null) {
				amount -= 1;
				continue;
			}

			currentProgress += progress;
		}

		return amount ? currentProgress / amount : null;
	});

	const isLauncherReady = ref(false);
	const currentlyPlaying = ref([]) as Ref<LocalDbPackage[]>;

	const gameDataOps = new ClientLibraryGameDataMutations(setGameData);
	const pkgDataOps = new ClientLibraryPackageDataMutations(setPackageData, unsetPackage);
	const pkgInstallOps = new ClientLibraryPackageInstallOperations(
		_getDb,
		currentlyPatching,
		currentlyUninstalling,
		gamesById,
		gameDataOps,
		pkgDataOps
	);

	const syncOps = new ClientLibrarySyncOperations(
		gamesById,
		packagesById,
		gameDataOps,
		pkgDataOps,
		pkgInstallOps
	);

	const pkgLaunchOps = new ClientLibraryPackageLaunchOperations(currentlyPlaying, pkgDataOps);

	if (GJ_ENVIRONMENT === 'development') {
		Config.env = 'development';
	}

	let _bootstrapPromise: Promise<void> | null = null;
	async function _bootstrap() {
		if (_bootstrapPromise) {
			return _bootstrapPromise;
		}

		let _bootstrapResolve: () => void = null as any;
		_bootstrapPromise = new Promise<void>(resolve => (_bootstrapResolve = resolve));

		console.log('Bootstrapping client library');

		await Config.setClientMutex();

		_db = await _getDb();
		console.log('LocalDB ready');

		packages.value = _db.packages.all();
		games.value = _db.games.all();

		await ClientUpdater.init();
		installerInit();
		launcherInit();

		syncOps.syncCheck();
		setInterval(() => syncOps.syncCheck(), 60 * 60 * 1000); // 1hr currently

		_bootstrapResolve();
	}

	_bootstrap();

	function installerInit() {
		checkQueueSettings();
		return retryAllInstallations();
	}

	function checkQueueSettings() {
		Queue.faster = {
			downloads: SettingMaxDownloadCount.get(),
			extractions: SettingMaxExtractCount.get(),
		};

		if (SettingQueueWhenPlaying.get()) {
			Queue.slower = {
				downloads: 0,
				extractions: 0,
			};
		} else {
			Queue.slower = Queue.faster;
		}
	}

	function retryAllInstallations() {
		const promises = [];
		// This will retry to install anything that was installing before client was closed.
		for (const localPackage of packages.value) {
			if (localPackage.isPatching && !localPackage.isPatchPaused) {
				promises.push(pkgInstallOps.installerRetry(localPackage));
			} else if (localPackage.isRemoving || localPackage.didRemoveFail) {
				// Since the old client version on nwjs 0.12.3 we solved a long lived bug that prevented users from
				// uninstalling packages that failed during uninstallation. The client now retries the uninstallations
				// properly - which means after the update users will receive a torrent of growl messages and system notifications
				// for each package that was now finally uninstalled successfully. Ungood, lets silence that.
				promises.push(
					pkgInstallOps.packageUninstall(localPackage, {
						dbOnly: false,
						notifications: false,
					})
				);
			}
		}

		return Promise.resolve(promises);
	}

	async function launcherInit() {
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
				const localPackage = packagesById.value[runningPackageId];
				if (localPackage && !localPackage.isRunning) {
					try {
						await pkgDataOps.setPackageRunningPid(localPackage, {
							wrapperId: localPackage.id.toString(),
						});
					} catch (e) {
						console.warn(`Could not mark package as running: ${localPackage.id}`);
						console.warn(e);
					}
				}
			}

			// Reattach all running games after a restart.
			for (const localPackage of packages.value) {
				if (localPackage.isRunning) {
					try {
						await pkgLaunchOps.launcherReattach(localPackage);
					} catch (e) {
						console.warn(e);
					}
				}
			}

			// We only mark the launcher as loaded once it at least finished reattaching to the
			// currently running instances.
			console.log('Launcher loaded and ready');

			isLauncherReady.value = true;
		} catch (err) {
			console.error('Failed to initialize everything for launcher');
			console.error(err);
			isLauncherReady.value = false;
		}
	}

	/**
	 * Returns an installed package that is most representative of this game's current state.
	 * It chooses which package to return according to its status: running > installing/patching > idle.
	 */
	function findPackageToRepresentGameStatus(gameId: number) {
		const localPackages = packagesByGameId.value[gameId] ?? null;
		if (!Array.isArray(localPackages) || !localPackages.length) {
			return null;
		}

		const playingPackage = localPackages.find(localPackage => localPackage.isRunning);
		if (playingPackage) {
			return playingPackage;
		}

		// Fetches installing or updating packages.
		// TODO: i'd like to handle packages in the middle of being uninstalled but
		// patching callers to this is out of scope for this rewrite atm.
		const patchingPackage = localPackages.find(localPackage => localPackage.isPatching);
		if (patchingPackage) {
			return patchingPackage;
		}

		// Return first package.
		return localPackages[0];
	}

	/**
	 * Finds an installed game by its title, doing a fuzzy search.
	 */
	function findInstalledGamesByTitle(query: string, limit = 3) {
		query = query.toLowerCase();
		return games.value
			.filter(i => fuzzysearch(query, i.title.toLowerCase()))
			.sort((g1, g2) => g1.title.localeCompare(g2.title))
			.slice(0, limit);
	}

	return {
		packages,
		games,
		packagesById,
		gamesById,
		packagesByGameId,
		currentlyPatching,
		currentlyUninstalling,
		numPatching,
		totalPatchProgress,
		currentlyPlaying,
		findPackageToRepresentGameStatus,
		findInstalledGamesByTitle,
		checkQueueSettings,
		packageInstall: pkgInstallOps.packageInstall.bind(pkgInstallOps),
		packageUpdate: pkgInstallOps.packageUpdate.bind(pkgInstallOps),
		packageUninstall: pkgInstallOps.packageUninstall.bind(pkgInstallOps),
		installerRetry: pkgInstallOps.installerRetry.bind(pkgInstallOps),
		installerPause: pkgInstallOps.installerPause.bind(pkgInstallOps),
		installerResume: pkgInstallOps.installerResume.bind(pkgInstallOps),
		launcherLaunch: pkgLaunchOps.launcherLaunch.bind(pkgLaunchOps),
	};
}
