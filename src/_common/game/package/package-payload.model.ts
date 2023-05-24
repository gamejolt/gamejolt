import { Sellable } from '../../sellable/sellable.model';
import { GameBuild } from '../build/build.model';
import { GameBuildLaunchOption } from '../build/launch-option/launch-option.model';
import { GameExternalPackage } from '../external-package/external-package.model';
import { GameRelease } from '../release/release.model';
import { GamePackage } from './package.model';

export class GamePackagePayloadModel {
	packages: GamePackage[];
	releases: GameRelease[];
	builds: GameBuild[];
	launchOptions: GameBuildLaunchOption[];
	sellables: Sellable[];
	installableBuilds?: GameBuild[];
	externalPackages: GameExternalPackage[];

	constructor(payload: any) {
		this.packages = payload.packages ? GamePackage.populate(payload.packages) : [];
		this.releases = payload.releases ? GameRelease.populate(payload.releases) : [];
		this.builds = payload.builds ? GameBuild.populate(payload.builds) : [];
		this.launchOptions = payload.launchOptions
			? GameBuildLaunchOption.populate(payload.launchOptions)
			: [];
		this.sellables = payload.sellables ? Sellable.populate(payload.sellables) : [];
		this.externalPackages = payload.externalPackages
			? GameExternalPackage.populate(payload.externalPackages)
			: [];

		const indexedPackages: { [k: number]: GamePackage } = {};
		const indexedReleases: { [k: number]: GameRelease } = {};
		const indexedSellables: { [k: number]: Sellable } = {};

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
