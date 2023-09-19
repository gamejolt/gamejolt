import { SellableModel } from '../../sellable/sellable.model';
import { GameBuildModel } from '../build/build.model';
import { GameBuildLaunchOptionModel } from '../build/launch-option/launch-option.model';
import { GameExternalPackageModel } from '../external-package/external-package.model';
import { GameReleaseModel } from '../release/release.model';
import { GamePackageModel } from './package.model';

export class GamePackagePayloadModel {
	declare packages: GamePackageModel[];
	declare releases: GameReleaseModel[];
	declare builds: GameBuildModel[];
	declare launchOptions: GameBuildLaunchOptionModel[];
	declare sellables: SellableModel[];
	declare installableBuilds?: GameBuildModel[];
	declare externalPackages: GameExternalPackageModel[];

	constructor(payload: any) {
		this.packages = payload.packages ? GamePackageModel.populate(payload.packages) : [];
		this.releases = payload.releases ? GameReleaseModel.populate(payload.releases) : [];
		this.builds = payload.builds ? GameBuildModel.populate(payload.builds) : [];
		this.launchOptions = payload.launchOptions
			? GameBuildLaunchOptionModel.populate(payload.launchOptions)
			: [];
		this.sellables = payload.sellables ? SellableModel.populate(payload.sellables) : [];
		this.externalPackages = payload.externalPackages
			? GameExternalPackageModel.populate(payload.externalPackages)
			: [];

		const indexedPackages: { [k: number]: GamePackageModel } = {};
		const indexedReleases: { [k: number]: GameReleaseModel } = {};
		const indexedSellables: { [k: number]: SellableModel } = {};

		this.packages.forEach(p => (indexedPackages[p.id] = p));
		this.releases.forEach(r => (indexedReleases[r.id] = r));
		this.sellables.forEach(s => (indexedSellables[s.resource_model!.id] = s));

		for (const _package of this.packages) {
			_package._releases = this.releases.filter(r => r.game_package_id === _package.id);
			_package._builds = this.builds.filter(b => b.game_package_id === _package.id);
			_package._sellable = indexedSellables[_package.id];

			// If this is the developer of the game, then spoof that they own the game/package.
			if (_package.is_game_owner && _package._sellable) {
				_package._sellable.is_owned = true;
			}
		}

		for (const release of this.releases) {
			release._package = indexedPackages[release.game_package_id];
			release._builds = (release._package!._builds || []).filter(
				b => b.game_release_id === release.id
			);
		}

		for (const build of this.builds) {
			build._package = indexedPackages[build.game_package_id];
			build._release = indexedReleases[build.game_release_id];
			build._launch_options = this.launchOptions.filter(l => l.game_build_id === build.id);
		}
	}
}
