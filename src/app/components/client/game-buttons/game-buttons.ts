import View from '!view!./game-buttons.html';
import * as fs from 'fs';
import { AppPopper } from 'game-jolt-frontend-lib/components/popper/popper';
import { Popper } from 'game-jolt-frontend-lib/components/popper/popper.service';
import * as path from 'path';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { Analytics } from '../../../../lib/gj-lib-client/components/analytics/analytics.service';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Device } from '../../../../lib/gj-lib-client/components/device/device.service';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { GamePackagePayloadModel } from '../../../../lib/gj-lib-client/components/game/package/package-payload.model';
import { GamePackagePurchaseModal } from '../../../../lib/gj-lib-client/components/game/package/purchase-modal/purchase-modal.service';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { arrayGroupBy } from '../../../../lib/gj-lib-client/utils/array';
import {
	ClientLibraryAction,
	ClientLibraryState,
	ClientLibraryStore,
} from '../../../store/client-library';
import { ClientInstallPackageModal } from '../install-package-modal/install-package-modal.service';
import { AppClientInstallProgress } from '../install-progress/install-progress';
import { LocalDbPackage } from '../local-db/package/package.model';

@View
@Component({
	components: {
		AppPopper,
		AppClientInstallProgress,
	},
	directives: {
		AppTooltip,
	},
})
export class AppClientGameButtons extends Vue {
	@ClientLibraryState
	packagesByGameId!: ClientLibraryStore['packagesByGameId'];

	@ClientLibraryState
	findActiveForGame!: ClientLibraryStore['findActiveForGame'];

	@ClientLibraryAction
	private packageInstall!: ClientLibraryStore['packageInstall'];

	@ClientLibraryAction
	private packageUninstall!: ClientLibraryStore['packageUninstall'];

	@ClientLibraryAction
	private launcherLaunch!: ClientLibraryStore['launcherLaunch'];

	@ClientLibraryAction
	private installerPause!: ClientLibraryStore['installerPause'];

	@ClientLibraryAction
	private installerResume!: ClientLibraryStore['installerResume'];

	@ClientLibraryAction
	private installerRetry!: ClientLibraryStore['installerRetry'];

	@Prop(Game)
	game!: Game;

	@Prop(Boolean)
	overlay?: boolean;

	@Prop(Boolean)
	small?: boolean;

	@Prop(Boolean)
	large?: boolean;

	@Prop(String)
	label?: string;

	@Prop(Boolean)
	hasInstallableBuilds?: boolean;

	@Prop(Boolean)
	canInstall?: boolean;

	@Prop(Boolean)
	noProgress?: boolean;

	isLoadingPackageData = false;
	packageDataPromise: Promise<GamePackagePayloadModel> | null = null;

	readonly LocalDbPackage = LocalDbPackage;
	readonly os = Device.os();
	readonly arch = Device.arch();

	@Watch('game')
	onGameChange() {
		this.isLoadingPackageData = false;
		this.packageDataPromise = null;
	}

	// We try to pull a package with some action on it.
	// For example, if a package is installing, we want to pull that one to show.
	get localPackage() {
		return this.findActiveForGame(this.game.id);
	}

	get gamePackages(): LocalDbPackage[] | undefined {
		return this.packagesByGameId[this.game.id];
	}

	get installTooltip() {
		if (!this.canInstall) {
			return this.$gettext(`This game is not available for installing on your OS.`);
		}
	}

	async install() {
		Analytics.trackEvent('client-game-buttons', 'install');

		if (!this.packageDataPromise) {
			this.packageDataPromise = this.fetchPackageData();
		}

		const packageData = await this.packageDataPromise;
		const byPackageId = arrayGroupBy(packageData.installableBuilds!, 'game_package_id');
		// If more than one package for their OS, then we have to show an install package modal.
		if (Object.keys(byPackageId).length > 1) {
			ClientInstallPackageModal.show(this.game);
			return;
		}

		const build = Game.chooseBestBuild(packageData.installableBuilds!, this.os!, this.arch);

		// If the build belongs to a pwyw package, open up the package
		// payment form.
		if (build._package!.shouldShowNamePrice()) {
			GamePackagePurchaseModal.show({
				game: this.game,
				package: build._package!,
				build: build,
				fromExtraSection: false,
			});
			return;
		}

		return this.packageInstall([
			this.game,
			build._package!,
			build._release!,
			build,
			build._launch_options!,
		]);
	}

	private async fetchPackageData() {
		const payload = await Api.sendRequest('/web/discover/games/packages/' + this.game.id);

		const packageData = new GamePackagePayloadModel(payload);
		packageData.installableBuilds = Game.pluckInstallableBuilds(
			packageData.packages,
			this.os!,
			this.arch
		);

		return packageData;
	}

	pause() {
		if (!this.localPackage) {
			return;
		}

		Analytics.trackEvent('client-game-buttons', 'pause-install');
		this.installerPause(this.localPackage);
	}

	resume() {
		if (!this.localPackage) {
			return;
		}

		Analytics.trackEvent('client-game-buttons', 'resume-install');
		this.installerResume(this.localPackage);
	}

	cancel() {
		if (!this.localPackage) {
			return;
		}

		Analytics.trackEvent('client-game-buttons', 'cancel-install');
		this.packageUninstall([this.localPackage]);
	}

	retryInstall() {
		if (!this.localPackage) {
			return;
		}

		Analytics.trackEvent('client-game-buttons', 'retry-install');
		this.installerRetry(this.localPackage);
	}

	launch(localPackage: LocalDbPackage) {
		// If already running, do nothing.
		if (localPackage.isRunning) {
			return;
		}

		Analytics.trackEvent('client-game-buttons', 'launch');
		Popper.hideAll();
		return this.launcherLaunch(localPackage);
	}

	openFolder(localPackage: LocalDbPackage) {
		fs.readdir(path.resolve(localPackage.install_dir), function(err, files) {
			if (err) {
				return;
			}

			// Just open the first file in the folder.
			// This way we open within the package folder instead of the parent folder.
			nw.Shell.showItemInFolder(path.resolve(localPackage.install_dir, files[0]));
		});
	}

	async uninstallPackage(localPackage: LocalDbPackage) {
		// If running, do nothing.
		if (localPackage.isRunning) {
			return;
		}

		Analytics.trackEvent('client-game-buttons', 'uninstall');
		Popper.hideAll();

		await this.packageUninstall([localPackage]);
	}
}
