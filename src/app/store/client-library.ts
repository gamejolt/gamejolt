import { computed, inject, InjectionKey, shallowRef } from 'vue';
import { arrayGroupBy, arrayIndexBy } from '../../utils/array';
import { fuzzysearch } from '../../utils/string';
import { HidePrivateKeys } from '../../utils/utils';
import { Api } from '../../_common/api/api.service';
import { Config } from '../../_common/client/client-voodoo-imports';
import { getDeviceArch, getDeviceOS } from '../../_common/device/device.service';
import type { GameBuild } from '../../_common/game/build/build.model';
import type { GameBuildLaunchOption } from '../../_common/game/build/launch-option/launch-option.model';
import type { GamePackage } from '../../_common/game/package/package.model';
import type { GameRelease } from '../../_common/game/release/release.model';
import type { LocalDbGame } from '../components/client/local-db/game/game.model';
import { LocalDb } from '../components/client/local-db/local-db.service';
import { LocalDbPackage } from '../components/client/local-db/package/package.model';

type ClientLibraryStoreInternal = ReturnType<typeof createClientLibraryStore>;
export type ClientLibraryStore = HidePrivateKeys<ClientLibraryStoreInternal>;

function asInternal(store: ClientLibraryStore) {
	return store as ClientLibraryStoreInternal;
}

export const ClientLibraryStoreKey: InjectionKey<ClientLibraryStore> =
	Symbol('client-library-store');

export function useClientLibraryStore() {
	return inject(ClientLibraryStoreKey)!;
}

export function createClientLibraryStore() {
	const packages = shallowRef<LocalDbPackage[]>([]);
	const games = shallowRef<LocalDbGame[]>([]);

	const packagesById = computed(() => arrayIndexBy(packages.value, 'id'));
	const gamesById = computed(() => arrayIndexBy(games.value, 'id'));
	const packagesByGameId = computed(() => arrayGroupBy(packages.value, 'game_id'));

	let _db = null as LocalDb | null;

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
		_db = await LocalDb.instance();
		console.log('LocalDB ready');

		packages.value = _db.packages.all();
		games.value = _db.games.all();

		// syncCheck();
		// setInterval(() => syncCheck(), 60 * 60 * 1000); // 1hr currently

		_bootstrapResolve();
	}

	async function _waitForBootstrapped() {
		if (_bootstrapPromise) {
			return _bootstrapPromise;
		}

		return _bootstrap();
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

	_bootstrap();

	return {
		packages,
		games,
		packagesById,
		gamesById,
		packagesByGameId,
		findPackageToRepresentGameStatus,
		_db,
		_waitForBootstrapped,
	};
}

/**
 * Returns an installed package that is most representative of this game's current state.
 * It chooses which package to return according to its status: running > installing/patching > idle.
 */
export function findPackageToRepresentGameStatus(store: ClientLibraryStore, gameId: number) {
	const localPackages = store.packagesByGameId.value[gameId] ?? null;
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
export function findInstalledGamesByTitle(store: ClientLibraryStore, query: string, limit = 3) {
	query = query.toLowerCase();
	return store.games.value
		.filter(i => fuzzysearch(query, i.title.toLowerCase()))
		.sort((g1, g2) => g1.title.localeCompare(g2.title))
		.slice(0, limit);
}

async function syncCheck(store: ClientLibraryStore) {
	console.log('Syncing library.');

	const builds = store.packages.value.map(i => i.build);

	const os = getDeviceOS();
	const arch = getDeviceArch();

	const request: any = {
		games: {},
		builds: {},
		os: os,
		arch: arch,
	};

	// The modified_on fields are what tells us if the client has up to date info
	// for each model.
	for (const localGame of store.games.value) {
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
				await syncGame(store, gameData.id, gameData);
			} catch (e) {
				console.error(e);
			}
		}
	}

	if (response.builds) {
		for (const buildData of response.builds) {
			try {
				await syncPackage(store, buildData.game_package_id, response);
			} catch (e) {
				console.error(e);
			}
		}
	}

	// TODO: implement this
	// if (response.updateBuilds) {
	// 	for (const data of response.updateBuilds) {
	// 		const packageId = data.packageId as number;
	// 		const newBuildId = data.newBuildId as number;

	// 		try {
	// 			const localPackage = this.packagesById[packageId];
	// 			if (!localPackage) {
	// 				throw new Error('Tried updating package not set in localdb.');
	// 			}

	// 			await this.packageStartUpdate([localPackage, newBuildId]);
	// 		} catch (e) {
	// 			console.error(e);
	// 		}
	// 	}
	// }
}

async function syncGame(store: ClientLibraryStore, gameId: number, data: Partial<LocalDbGame>) {
	const localGame = store.gamesById.value[gameId];
	if (!localGame) {
		throw new Error('Game is not set in localdb.');
	}

	await setGameData(store, localGame, data);
}

async function setGameData(
	store: ClientLibraryStore,
	localGame: LocalDbGame,
	data: Partial<LocalDbGame>
) {
	_setGameData(localGame, data);

	const { _db, _waitForBootstrapped } = asInternal(store);
	await _waitForBootstrapped();
	_db!.games.put(localGame);
	await _db!.games.save();

	if (!store.gamesById.value[localGame.id]) {
		store.games.value.push(localGame);
	}
}

function _setGameData(localGame: LocalDbGame, data: Partial<LocalDbGame>) {
	localGame.set(data);
}

async function syncPackage(store: ClientLibraryStore, packageId: number, data: any) {
	const localPackage = store.packagesById.value[packageId];
	if (!localPackage) {
		throw new Error('Game is not set in localdb.');
	}

	const pkg = (data.packages as GamePackage[]).find(a => a.id === localPackage.id);
	const release = (data.releases as GameRelease[]).find(a => a.id === localPackage.release.id);
	const build = (data.builds as GameBuild[]).find(a => a.id === localPackage.build.id);
	const launchOptions = (data.launchOptions as GameBuildLaunchOption[]).filter(
		a => a.game_build_id === localPackage.build.id
	);

	// If those are not set then this package is not even valid.
	if (!pkg || !release || !build) {
		throw new Error(
			`Package ${localPackage.id} is no longer valid. ` +
				`The payload did not contain the package, it's release (${localPackage.release.id})` +
				` or it's build (${localPackage.build.id})`
		);
	}

	await setPackageData(
		store,
		localPackage,
		LocalDbPackage.fromSitePackageInfo(pkg, release, build, launchOptions)
	);
}

async function setPackageData(
	store: ClientLibraryStore,
	localPackage: LocalDbPackage,
	data: Partial<LocalDbPackage>
) {
	_setPackageData(localPackage, data);

	const { _db, _waitForBootstrapped } = asInternal(store);
	await _waitForBootstrapped();
	_db!.packages.put(localPackage);
	await _db!.packages.save();

	if (!store.packagesById.value[localPackage.id]) {
		store.packages.value.push(localPackage);
	}
}

function _setPackageData(localPackage: LocalDbPackage, data: Partial<LocalDbPackage>) {
	localPackage.set(data);
}

export const clientLibraryStore = createClientLibraryStore();
