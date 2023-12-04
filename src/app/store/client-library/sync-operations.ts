import { ComputedRef } from 'vue';
import { Api } from '../../../_common/api/api.service';
import { getDeviceArch, getDeviceOS } from '../../../_common/device/device.service';
import type { GameBuildModel } from '../../../_common/game/build/build.model';
import type { GameBuildLaunchOptionModel } from '../../../_common/game/build/launch-option/launch-option.model';
import type { GamePackageModel } from '../../../_common/game/package/package.model';
import type { GameReleaseModel } from '../../../_common/game/release/release.model';
import type { LocalDbGame } from '../../components/client/local-db/game/game.model';
import { LocalDbPackage } from '../../components/client/local-db/package/package.model';
import type ClientLibraryGameDataMutations from './game-data-mutations';
import type ClientLibraryPackageDataMutations from './package-data-mutations';
import type ClientLibraryPackageInstallOperations from './package-install-operations';

export default class ClientLibrarySyncOperations {
	constructor(
		private gamesById: ComputedRef<{ [id: string]: LocalDbGame | undefined }>,
		private packagesById: ComputedRef<{ [id: string]: LocalDbPackage | undefined }>,
		private gameDataOps: ClientLibraryGameDataMutations,
		private pkgDataOps: ClientLibraryPackageDataMutations,
		private pkgInstallOps: ClientLibraryPackageInstallOperations
	) {}

	async syncCheck() {
		console.log('Syncing library.');

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
		for (const localGame of Object.values(this.gamesById.value)) {
			request.games[localGame!.id] = localGame!.modified_on || 0;
		}

		for (const localPackage of Object.values(this.packagesById.value)) {
			const build = localPackage!.build;
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
