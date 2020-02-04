import * as fs from 'fs';
import * as path from 'path';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Analytics } from '../../../../../_common/analytics/analytics.service';
import { Device } from '../../../../../_common/device/device.service';
import AppExpand from '../../../../../_common/expand/expand.vue';
import { filesize } from '../../../../../_common/filters/filesize';
import { GameBuild } from '../../../../../_common/game/build/build.model';
import { Game } from '../../../../../_common/game/game.model';
import { GamePackageCardModel } from '../../../../../_common/game/package/card/card.model';
import AppGamePackageCardMoreOptions from '../../../../../_common/game/package/card/more-options.vue';
import { GamePackage } from '../../../../../_common/game/package/package.model';
import { Popper } from '../../../../../_common/popper/popper.service';
import AppPopper from '../../../../../_common/popper/popper.vue';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip';
import {
	ClientLibraryAction,
	ClientLibraryState,
	ClientLibraryStore,
} from '../../../../store/client-library';
import AppClientInstallProgress from '../../install-progress/install-progress.vue';
import {
	LocalDbPackage,
	LocalDbPackagePatchState,
	LocalDbPackageRemoveState,
} from '../../local-db/package/package.model';

@Component({
	components: {
		AppExpand,
		AppPopper,
		AppClientInstallProgress,
		AppGamePackageCardMoreOptions,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		filesize,
	},
})
export default class AppClientPackageCardButtons extends Vue {
	@ClientLibraryState
	packagesById!: ClientLibraryStore['packagesById'];

	@ClientLibraryAction
	private packageInstall!: ClientLibraryStore['packageInstall'];

	@ClientLibraryAction
	private packageUninstall!: ClientLibraryStore['packageUninstall'];

	@ClientLibraryAction
	private installerPause!: ClientLibraryStore['installerPause'];

	@ClientLibraryAction
	private installerResume!: ClientLibraryStore['installerResume'];

	@ClientLibraryAction
	private installerRetry!: ClientLibraryStore['installerRetry'];

	@ClientLibraryAction
	private launcherLaunch!: ClientLibraryStore['launcherLaunch'];

	@Prop(Game)
	game!: Game;
	@Prop(GamePackage)
	package!: GamePackage;
	@Prop(GamePackageCardModel)
	card!: GamePackageCardModel;

	build: GameBuild | null = null;
	downloadableUnsupported = false;
	downloadableUnsupportedHasQuickPlay = false;

	readonly Device = Device;
	readonly PatchState = LocalDbPackagePatchState;
	readonly RemoveState = LocalDbPackageRemoveState;

	get canInstall() {
		const arch = Device.arch();
		const os = Device.os();

		return this.card.downloadableBuild
			? Game.checkDeviceSupport(this.card.downloadableBuild, os!, arch)
			: false;
	}

	get localPackage(): LocalDbPackage | undefined {
		return this.packagesById[this.package.id];
	}

	created() {
		// We want to put the installable build in extra builds as well.
		// This way they can also download it if they don't want to install.
		if (this.card.downloadableBuild) {
			this.build = this.card.downloadableBuild;

			// Gotta use the showcased OS for this since it's the OS that this build fulfilled.
			this.card.extraBuilds.unshift({
				type: this.build.type,
				icon: this.card.platformSupportInfo[this.card.showcasedOs].icon,
				build: this.build,
				arch: this.card.platformSupportInfo[this.card.showcasedOs].arch || null,
				platform: this.build.type,
			});
		}

		// If the browser build isn't an HTML/ROM build, then it can't be
		// quick played in their client.
		if (
			this.card.browserBuild &&
			this.card.browserBuild.type !== GameBuild.TYPE_HTML &&
			this.card.browserBuild.type !== GameBuild.TYPE_ROM
		) {
			this.build = this.card.browserBuild;

			this.card.extraBuilds.unshift({
				type: this.build.type,
				icon: this.card.platformSupportInfo[this.build.type].icon,
				build: this.build,
				platform: this.build.type,
				arch: null,
			});

			// Clear out the browser build since it's not quick playable.
			this.card.browserBuild = null;
		}

		// If we can't install the downloadable build, then we need to show a message.
		if (this.card.downloadableBuild && !this.canInstall) {
			// If there is a quick play web build, then we show a different msg.
			if (this.card.browserBuild) {
				this.downloadableUnsupportedHasQuickPlay = true;
			} else {
				this.downloadableUnsupported = true;
			}
		}
	}

	buildClick(build: GameBuild, fromExtraSection?: boolean) {
		this.$emit('click', { build, fromExtraSection });
	}

	installClick(build: GameBuild) {
		if (build._package!.shouldShowNamePrice()) {
			this.$emit('show-build-payment', build);
			return;
		}

		this.startInstall(build);
	}

	startInstall(build: GameBuild) {
		Analytics.trackEvent('game-package-card', 'install');

		this.packageInstall([
			this.game,
			build._package!,
			build._release!,
			build,
			build._launch_options!,
		]);
	}

	pauseInstall() {
		if (!this.localPackage) {
			throw new Error(`Local package isn't set`);
		}

		Analytics.trackEvent('game-package-card', 'pause-install');
		this.installerPause(this.localPackage);
	}

	resumeInstall() {
		if (!this.localPackage) {
			throw new Error(`Local package isn't set`);
		}

		Analytics.trackEvent('game-package-card', 'resume-install');
		this.installerResume(this.localPackage);
	}

	cancelInstall() {
		if (!this.localPackage) {
			throw new Error(`Local package isn't set`);
		}

		Analytics.trackEvent('game-package-card', 'cancel-install');
		this.packageUninstall([this.localPackage]);
	}

	retryInstall() {
		if (!this.localPackage) {
			throw new Error(`Local package isn't set`);
		}

		Analytics.trackEvent('game-package-card', 'retry-install');
		this.installerRetry(this.localPackage);
	}

	launchPackage() {
		if (!this.localPackage) {
			throw new Error(`Local package isn't set`);
		}

		Analytics.trackEvent('game-package-card', 'launch');
		this.launcherLaunch(this.localPackage);
	}

	openFolder() {
		if (!this.localPackage) {
			throw new Error(`Local package isn't set`);
		}

		fs.readdir(path.resolve(this.localPackage.install_dir), (err, files) => {
			if (err) {
				return;
			}

			// Just open the first file in the folder.
			// This way we open within the package folder instead of the parent folder.
			nw.Shell.showItemInFolder(path.resolve(this.localPackage!.install_dir, files[0]));
		});
	}

	uninstall() {
		// Can't if the package is running.
		if (!this.localPackage || this.localPackage.isRunning) {
			return;
		}

		Analytics.trackEvent('game-package-card', 'uninstall');
		Popper.hideAll();

		this.packageUninstall([this.localPackage]);
	}

	retryUninstall() {
		if (!this.localPackage) {
			throw new Error(`Local package isn't set`);
		}

		Analytics.trackEvent('game-package-card', 'retry-uninstall');
		Popper.hideAll();

		this.packageUninstall([this.localPackage]);
	}
}
