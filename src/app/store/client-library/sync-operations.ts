import { ComputedRef } from 'vue';

import type { LocalDbGame } from '~app/components/client/local-db/game/game.model';
import { LocalDbPackage } from '~app/components/client/local-db/package/package.model';
import type ClientLibraryGameDataMutations from '~app/store/client-library/game-data-mutations';
import type ClientLibraryPackageDataMutations from '~app/store/client-library/package-data-mutations';
import type ClientLibraryPackageInstallOperations from '~app/store/client-library/package-install-operations';
import { Api } from '~common/api/api.service';
import { getDeviceArch, getDeviceOS } from '~common/device/device.service';
import type { GameBuildModel } from '~common/game/build/build.model';
import type { GameBuildLaunchOptionModel } from '~common/game/build/launch-option/launch-option.model';
import type { GamePackageModel } from '~common/game/package/package.model';
import type { GameReleaseModel } from '~common/game/release/release.model';
import { sleep } from '~utils/utils';

// Default assumption for max page size of the client/sync endpoint.
// Real limit is returned as part of the first request response.
const DefaultSyncPageSize = 1000;

// Wait between submitting pages.
const SyncPaginationDelay = 5 * 60 * 1000;

// After fetching all pages, how long to wait until the next full fetch
// should start.
const SyncInterval = 60 * 60 * 1000;

type SyncEntry = [id: number, modifiedOn: number];

type ApiResponse = {
	games: any[] | undefined;
	builds: any[] | undefined;
	updateBuilds: any[] | undefined;

	// Pagination fields.
	gamesPaginate?: boolean;
	buildsPaginate?: boolean;
	pageSize?: number;
};

export default class ClientLibrarySyncOperations {
	private pageSize = DefaultSyncPageSize;
	private nextSyncHandle: ReturnType<typeof setTimeout> | null = null;
	private started = false;

	constructor(
		private gamesById: ComputedRef<{ [id: string]: LocalDbGame | undefined }>,
		private packagesById: ComputedRef<{ [id: string]: LocalDbPackage | undefined }>,
		private gameDataOps: ClientLibraryGameDataMutations,
		private pkgDataOps: ClientLibraryPackageDataMutations,
		private pkgInstallOps: ClientLibraryPackageInstallOperations
	) {}

	/**
	 * Kicks off the recurring library sync loop. Call once during bootstrap.
	 * Each cycle schedules the next one when it finishes.
	 */
	startSyncLoop() {
		if (this.started) {
			return;
		}
		this.started = true;
		this.runSyncCycle();
	}

	private scheduleNextCycle(delay: number) {
		if (this.nextSyncHandle) {
			clearTimeout(this.nextSyncHandle);
		}
		this.nextSyncHandle = setTimeout(() => this.runSyncCycle(), delay);
	}

	private async runSyncCycle() {
		try {
			await this.syncCheck();
		} catch (e) {
			console.error('Library sync cycle failed.', e);
		}

		// Line up the next sync cycle:
		this.scheduleNextCycle(SyncInterval);
	}

	async syncCheck() {
		console.log('Syncing library.');

		const os = getDeviceOS();
		const arch = getDeviceArch();

		// The modified_on fields are what tell the endpoint whether the client
		// has up to date info for each model.
		const gameEntries: SyncEntry[] = Object.values(this.gamesById.value).map(localGame => [
			localGame!.id,
			localGame!.modified_on || 0,
		]);
		const buildEntries: SyncEntry[] = Object.values(this.packagesById.value).map(
			localPackage => {
				const build = localPackage!.build;
				return [build.id, build.modified_on || 0];
			}
		);

		let gamesOffset = 0;
		let buildsOffset = 0;
		let gamesDone = gameEntries.length === 0;
		let buildsDone = buildEntries.length === 0;
		let isFirstPage = true;

		// Keep requesting pages until the endpoint stops asking us to paginate
		// for both lists. games and builds paginate independently — once one is
		// exhausted we keep submitting just the other. Each request sends every
		// entry we haven't synced yet; the endpoint consumes one page from it.
		while (isFirstPage || !gamesDone || !buildsDone) {
			// Delay requesting between pages.
			if (!isFirstPage) {
				await sleep(SyncPaginationDelay);
			}
			isFirstPage = false;

			const gamesPage: SyncEntry[] = gamesDone ? [] : gameEntries.slice(gamesOffset);
			const buildsPage: SyncEntry[] = buildsDone ? [] : buildEntries.slice(buildsOffset);

			const request: any = {
				games: entriesToMap(gamesPage),
				builds: entriesToMap(buildsPage),
				os: os,
				arch: arch,
			};

			const response = (await Api.sendRequest('/web/client/sync', request, {
				detach: true,

				// If we allowed it to sanitize, it would filter out arrays in the request.
				sanitizeComplexData: false,
			})) as ApiResponse;

			// Override our page-size assumption with the real value the endpoint
			// reports.
			if (typeof response.pageSize === 'number' && response.pageSize > 0) {
				this.pageSize = response.pageSize;
			}

			await this.applySyncResponse(response);

			// The endpoint consumed at most one page of what we submitted, so
			// advance past that page. The `>= length` guard also stops us if the
			// endpoint keeps asking to paginate once we've submitted everything.
			if (!gamesDone) {
				gamesOffset += Math.min(this.pageSize, gamesPage.length);
				if (!response.gamesPaginate || gamesOffset >= gameEntries.length) {
					gamesDone = true;
				}
			}

			if (!buildsDone) {
				buildsOffset += Math.min(this.pageSize, buildsPage.length);
				if (!response.buildsPaginate || buildsOffset >= buildEntries.length) {
					buildsDone = true;
				}
			}
		}
	}

	private async applySyncResponse(response: ApiResponse) {
		// Important! Don't fail the whole thing if any of these fail.
		if (response.games) {
			for (const gameData of response.games) {
				try {
					await this.syncGame(gameData.id, gameData);
				} catch (e) {
					console.error(e);
				}
			}
		}

		if (response.builds) {
			for (const buildData of response.builds) {
				try {
					await this.syncPackage(buildData.game_package_id, response);
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
					const localPackage = this.packagesById.value[packageId];
					if (!localPackage) {
						throw new Error('Tried updating package not set in localdb.');
					}

					await this.pkgInstallOps.packageUpdate(localPackage, newBuildId);
				} catch (e) {
					console.error(e);
				}
			}
		}
	}

	async syncGame(gameId: number, data: Partial<LocalDbGame>) {
		const localGame = this.gamesById.value[gameId];
		if (!localGame) {
			throw new Error('Game is not set in localdb.');
		}

		await this.gameDataOps.setGameData(localGame, data);
	}

	async syncPackage(packageId: number, data: any) {
		const localPackage = this.packagesById.value[packageId];
		if (!localPackage) {
			throw new Error('Game is not set in localdb.');
		}

		const pkg = (data.packages as GamePackageModel[]).find(a => a.id == localPackage.id);
		const release = (data.releases as GameReleaseModel[]).find(
			a => a.id == localPackage.release.id
		);
		const build = (data.builds as GameBuildModel[]).find(a => a.id == localPackage.build.id);
		const launchOptions = (data.launchOptions as GameBuildLaunchOptionModel[]).filter(
			a => a.game_build_id == localPackage.build.id
		);

		// If those are not set then this package is not even valid.
		if (!pkg || !release || !build) {
			throw new Error(
				`Package ${localPackage.id} is no longer valid. ` +
					`The payload did not contain the package, it's release (${localPackage.release.id})` +
					` or it's build (${localPackage.build.id})`
			);
		}

		await this.pkgDataOps.setPackageData(
			localPackage,
			LocalDbPackage.fromSitePackageInfo(pkg, release, build, launchOptions)
		);
	}
}

function entriesToMap(entries: SyncEntry[]) {
	const map: { [id: number]: number } = {};
	for (const [id, modifiedOn] of entries) {
		map[id] = modifiedOn;
	}
	return map;
}
