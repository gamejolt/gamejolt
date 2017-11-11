import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./game-buttons.html';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { Device } from '../../../../lib/gj-lib-client/components/device/device.service';
import { State } from 'vuex-class';
import { ClientLibraryStore, ClientLibraryAction } from '../../../store/client-library';
import { LocalDbPackage } from '../local-db/package/package.model';
import { GamePackagePayloadModel } from '../../../../lib/gj-lib-client/components/game/package/package-payload.model';
import { Analytics } from '../../../../lib/gj-lib-client/components/analytics/analytics.service';
import { Popover } from '../../../../lib/gj-lib-client/components/popover/popover.service';

import gui from 'nw.gui';
import * as fs from 'fs';
import * as path from 'path';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { arrayGroupBy } from '../../../../lib/gj-lib-client/utils/array';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppPopoverTrigger } from '../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { AppPopover } from '../../../../lib/gj-lib-client/components/popover/popover';
import { AppClientInstallProgress } from '../install-progress/install-progress';
import { ClientInstallPackageModal } from '../install-package-modal/install-package-modal.service';
import { Store } from '../../../store/index';

@View
@Component({
	components: {
		AppJolticon,
		AppPopover,
		AppClientInstallProgress,
	},
	directives: {
		AppTooltip,
		AppPopoverTrigger,
	},
})
export class AppClientGameButtons extends Vue {
	@State clientLibrary: Store['clientLibrary'];
	@ClientLibraryAction packageInstall: ClientLibraryStore['packageInstall'];
	@ClientLibraryAction launcherLaunch: ClientLibraryStore['launcherLaunch'];
	@ClientLibraryAction installerPause: ClientLibraryStore['installerPause'];
	@ClientLibraryAction installerResume: ClientLibraryStore['installerResume'];
	@ClientLibraryAction installerRetry: ClientLibraryStore['installerRetry'];

	@Prop(Game) game: Game;
	@Prop(Boolean) overlay?: boolean;
	@Prop(Boolean) small?: boolean;
	@Prop(Boolean) large?: boolean;
	@Prop(String) label?: string;
	@Prop(Boolean) hasInstallableBuilds?: boolean;
	@Prop(Boolean) canInstall?: boolean;

	isLoadingPackageData = false;
	packageDataPromise: Promise<GamePackagePayloadModel> | null = null;
	installTooltip: string | null = null;

	readonly LocalDbPackage = LocalDbPackage;
	readonly os = Device.os();
	readonly arch = Device.arch();

	// TODO(rewrite) when switching between games for some reason the header game buttons don't update???
	// E.G. go to eggnogg page and click install, then go to bendy and click install and it'll show the pwyw form for eggnogg
	// The local variables like isLoadingPackageData and packageDataPromise don't seem to get reinitialized when switching games.
	// The component doesn't get recreated.

	// We try to pull a package with some action on it.
	// For example, if a package is installing, we want to pull that one to show.
	get localPackage() {
		return this.clientLibrary.findActiveForGame(this.game.id);
	}

	get gamePackages(): LocalDbPackage[] | undefined {
		return this.clientLibrary.packagesByGameId[this.game.id];
	}

	created() {
		if (!this.hasInstallableBuilds) {
			this.installTooltip = this.$gettext(`This game doesn't have any installable builds yet.`);
		} else if (!this.canInstall) {
			this.installTooltip = this.$gettext(`This game is not available for installing on your OS.`);
		}
	}

	async install() {
		Analytics.trackEvent('client-game-buttons', 'install');

		if (!this.packageDataPromise) {
			this.packageDataPromise = this._install();
		}

		const packageData = await this.packageDataPromise;
		const byPackageId = arrayGroupBy(packageData.installableBuilds!, 'game_package_id');
		// If more than one package for their OS, then we have to show an install package modal.
		if (Object.keys(byPackageId).length > 1) {
			// TODO(rewrite,cros) this works and will show a popup to select package from these,
			// but it looks weird if we also scroll and show a "please select package" in the game page,
			// Should we both emit show-multiple-packages which causes the scroll AND open the modal?
			ClientInstallPackageModal.show(this.game);

			// this.$emit('show-multiple-packages');
			return;
		}

		const build = Game.chooseBestBuild(packageData.installableBuilds!, this.os!, this.arch);

		// If the build belongs to a pwyw package, open up the package
		// payment form.
		if (build._package!.shouldShowNamePrice()) {
			this.$emit('show-package-payment', build._package);
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

	private async _install() {
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
		this.localPackage.uninstall(false);
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
		Popover.hideAll();
		return this.launcherLaunch(localPackage);
	}

	openFolder(localPackage: LocalDbPackage) {
		fs.readdir(path.resolve(localPackage.install_dir), function(err, files) {
			if (err) {
				return;
			}

			// Just open the first file in the folder.
			// This way we open within the package folder instead of the parent folder.
			gui.Shell.showItemInFolder(path.resolve(localPackage.install_dir, files[0]));
		});
	}

	uninstallPackage(localPackage: LocalDbPackage) {
		// If running, do nothing.
		if (localPackage.isRunning) {
			return;
		}

		Analytics.trackEvent('client-game-buttons', 'uninstall');
		Popover.hideAll();
		return localPackage.uninstall(false);
	}
}
