import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./package-card-buttons.html?style=./package-card-buttons.styl';
import { PatchState, LocalDbPackage } from '../local-db/package/package.model';
import { GameBuild } from '../../../../lib/gj-lib-client/components/game/build/build.model';
import { Device } from '../../../../lib/gj-lib-client/components/device/device.service';
import { GamePackageCardModel } from '../../../../lib/gj-lib-client/components/game/package/card/card.model';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { GamePackage } from '../../../../lib/gj-lib-client/components/game/package/package.model';
import { State } from 'vuex-class';
import { Analytics } from '../../../../lib/gj-lib-client/components/analytics/analytics.service';
import {
	ClientLibraryStore,
	ClientLibraryAction,
	ClientLibraryGetter,
} from '../../../store/client-library';
import { Popover } from '../../../../lib/gj-lib-client/components/popover/popover.service';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { filesize } from '../../../../lib/gj-lib-client/vue/filters/filesize';
import { AppExpand } from '../../../../lib/gj-lib-client/components/expand/expand';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { AppPopover } from '../../../../lib/gj-lib-client/components/popover/popover';
import { AppPopoverTrigger } from '../../../../lib/gj-lib-client/components/popover/popover-trigger.directive.vue';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppClientInstallProgress } from '../install-progress/install-progress';
import { AppGamePackageCardMoreOptions } from '../../../../lib/gj-lib-client/components/game/package/card/more-options';
import * as fs from 'fs';
import * as path from 'path';
import gui from 'nw.gui';

@View
@Component({
	components: {
		AppJolticon,
		AppExpand,
		AppPopover,
		AppClientInstallProgress,
		AppGamePackageCardMoreOptions,
	},
	directives: {
		AppTooltip,
		AppPopoverTrigger,
		AppTrackEvent,
	},
	filters: {
		filesize,
	},
})
export class AppClientPackageCardButtons extends Vue {
	// TODO(rewrite) should we use Store['clientLibrary'] here?
	@State clientLibrary: ClientLibraryStore;
	@ClientLibraryGetter packagesById: ClientLibraryStore['packagesById'];
	@ClientLibraryAction packageInstall: ClientLibraryStore['packageInstall'];
	@ClientLibraryAction installerPause: ClientLibraryStore['installerPause'];
	@ClientLibraryAction installerResume: ClientLibraryStore['installerResume'];
	@ClientLibraryAction installerRetry: ClientLibraryStore['installerRetry'];
	@ClientLibraryAction launcherLaunch: ClientLibraryStore['launcherLaunch'];

	@Prop(Game) game: Game;
	@Prop(GamePackage) package: GamePackage;
	@Prop(GamePackageCardModel) card: GamePackageCardModel;

	build: GameBuild | null = null;
	downloadableUnsupported = false;
	downloadableUnsupportedHasQuickPlay = false;

	readonly Device = makeObservableService(Device);
	readonly PatchState = PatchState;

	get canInstall() {
		const arch = Device.arch();
		const os = Device.os();

		return this.card.downloadableBuild
			? Game.checkDeviceSupport(this.card.downloadableBuild, os!, arch)
			: false;
	}

	get localPackage(): LocalDbPackage | undefined {
		return this.clientLibrary.packagesById[this.package.id];
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
		this.localPackage.uninstall(false);
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
			gui.Shell.showItemInFolder(path.resolve(this.localPackage!.install_dir, files[0]));
		});
	}

	uninstall() {
		// Can't if the package is running.
		if (!this.localPackage || this.localPackage.isRunning) {
			return;
		}

		Analytics.trackEvent('game-package-card', 'uninstall');
		this.localPackage.uninstall(false);
		Popover.hideAll();
	}
}

// angular.module('App.Client.PackageCardButtons').directive('gjClientPackageCardButtons', function() {
// 	return {
// 		restrict: 'E',
// 		require: '^gjGamePackageCard',
// 		scope: true,
// 		template: require('!html-loader!./package-card-buttons.html'),
// 		controller: function(
// 			$scope,
// 			Device,
// 			Analytics,
// 			Client_Library,
// 			Client_Installer,
// 			Client_Launcher,
// 			LocalDb_Package,
// 			Game,
// 			Game_Build,
// 			Popover
// 		) {
// 			// Parent scope controller.
// 			var ctrl = $scope.ctrl;

// 			// Needed for constants on parent.
// 			ctrl.LocalDb_Package = LocalDb_Package;

// 			$scope.Client_Library = Client_Library;
// 			$scope.LocalDb_Package = LocalDb_Package;

// 			var build;
// 			var arch = Device.arch();
// 			var os = Device.os();

// 			ctrl.canInstall = ctrl.downloadableBuild
// 				? Game.checkDeviceSupport(ctrl.downloadableBuild, os, arch)
// 				: false;

// 			// We want to put the installable build in extra builds as well.
// 			// This way they can also download it if they don't want to install.
// 			if (ctrl.downloadableBuild) {
// 				build = ctrl.downloadableBuild;

// 				// Gotta use the showcased OS for this since it's the OS that this build fulfilled.
// 				ctrl.extraBuilds.unshift({
// 					type: build.type,
// 					icon: ctrl.supportInfo[ctrl.showcasedOs].icon,
// 					build: build,
// 					arch: ctrl.supportInfo[ctrl.showcasedOs].arch,
// 				});
// 			}

// 			// If the browser build isn't an HTML/ROM build, then it can't be
// 			// quick played in their client.
// 			if (
// 				ctrl.browserBuild &&
// 				ctrl.browserBuild.type != Game_Build.TYPE_HTML &&
// 				ctrl.browserBuild.type != Game_Build.TYPE_ROM
// 			) {
// 				build = ctrl.browserBuild;
// 				ctrl.extraBuilds.unshift({
// 					type: build.type,
// 					icon: ctrl.supportInfo[build.type].icon,
// 					build: build,
// 				});

// 				// Clear out the browser build since it's not quick playable.
// 				ctrl.browserBuild = null;
// 			}

// 			// If we can't install the downloadable build, then we need to show a message.
// 			if (ctrl.downloadableBuild && !ctrl.canInstall) {
// 				// If there is a quick play web build, then we show a different msg.
// 				if (ctrl.browserBuild) {
// 					ctrl.downloadableUnsupportedHasQuickPlay = true;
// 				} else {
// 					ctrl.downloadableUnsupported = true;
// 				}
// 			}

// 			// We watch their library to see if this package is installed.
// 			$scope.$watch('Client_Library.packages[ ctrl.package.id ]', function(localPackage) {
// 				ctrl.localPackage = localPackage;
// 			});

// 			ctrl.installClick = function(build) {
// 				if (ctrl.showPayment(build)) {
// 					return;
// 				}

// 				ctrl.startInstall(build);
// 			};

// 			ctrl.startInstall = function(build) {
// 				Analytics.trackEvent('game-package-card', 'install');

// 				Client_Library.installPackage(
// 					ctrl.game,
// 					build._package,
// 					build._release,
// 					build,
// 					build._launch_options
// 				);

// 				ctrl.isPaymentOpen = false;
// 			};

// 			ctrl.pauseInstall = function() {
// 				Analytics.trackEvent('game-package-card', 'pause-install');
// 				Client_Installer.pause(ctrl.localPackage);
// 			};

// 			ctrl.resumeInstall = function() {
// 				Analytics.trackEvent('game-package-card', 'resume-install');
// 				Client_Installer.resume(ctrl.localPackage);
// 			};

// 			ctrl.cancelInstall = function() {
// 				Analytics.trackEvent('game-package-card', 'cancel-install');
// 				ctrl.localPackage.$uninstall();
// 			};

// 			ctrl.retryInstall = function() {
// 				Analytics.trackEvent('game-package-card', 'retry-install');
// 				Client_Installer.retryInstall(ctrl.localPackage);
// 			};

// 			ctrl.launchPackage = function() {
// 				Analytics.trackEvent('game-package-card', 'launch');
// 				Client_Launcher.launch(ctrl.localPackage);
// 			};

// 			ctrl.uninstall = function() {
// 				// Can't if the package is running.
// 				if (ctrl.localPackage.isRunning()) {
// 					return;
// 				}

// 				Analytics.trackEvent('game-package-card', 'uninstall');
// 				ctrl.localPackage.$uninstall();
// 				Popover.hideAll();
// 			};
// 		},
// 	};
// });
