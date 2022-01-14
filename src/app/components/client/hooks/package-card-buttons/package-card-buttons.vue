<script lang="ts">
import * as fs from 'fs';
import * as path from 'path';
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { Analytics } from '../../../../../_common/analytics/analytics.service';
import { getDeviceArch, getDeviceOS } from '../../../../../_common/device/device.service';
import AppExpand from '../../../../../_common/expand/expand.vue';
import { formatFilesize } from '../../../../../_common/filters/filesize';
import { GameBuild } from '../../../../../_common/game/build/build.model';
import { Game } from '../../../../../_common/game/game.model';
import { GamePackageCardModel } from '../../../../../_common/game/package/card/card.model';
import AppGamePackageCardMoreOptions from '../../../../../_common/game/package/card/more-options.vue';
import { GamePackage } from '../../../../../_common/game/package/package.model';
import { Popper } from '../../../../../_common/popper/popper.service';
import AppPopper from '../../../../../_common/popper/popper.vue';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
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

@Options({
	components: {
		AppExpand,
		AppPopper,
		AppClientInstallProgress,
		AppGamePackageCardMoreOptions,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppClientPackageCardButtons extends Vue {
	@Prop(Object)
	game!: Game;

	@Prop(Object)
	package!: GamePackage;

	@Prop(Object)
	card!: GamePackageCardModel;

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

	build: GameBuild | null = null;
	downloadableUnsupported = false;
	downloadableUnsupportedHasQuickPlay = false;

	readonly PatchState = LocalDbPackagePatchState;
	readonly RemoveState = LocalDbPackageRemoveState;
	readonly formatFilesize = formatFilesize;

	@Emit('click')
	emitClick(_data: { build: GameBuild; fromExtraSection?: boolean }) {}

	@Emit('show-build-payment')
	emitShowBuildPayment(_build: GameBuild) {}

	get canInstall() {
		const arch = getDeviceArch();
		const os = getDeviceOS();

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
		this.emitClick({ build, fromExtraSection });
	}

	installClick(build: GameBuild) {
		if (build._package!.shouldShowNamePrice()) {
			this.emitShowBuildPayment(build);
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
</script>

<template>
	<div class="package-card-buttons">
		<!-- Messaging for weird cases... -->
		<div v-if="downloadableUnsupported" class="alert">
			<p>
				<app-jolticon icon="notice" notice />
				<translate>This package can not be installed on your system.</translate>
			</p>
		</div>

		<div v-if="downloadableUnsupportedHasQuickPlay" class="alert">
			<p>
				<app-jolticon icon="notice" notice />
				<translate>
					This package can not be installed on your system, but can be quick played in the
					client.
				</translate>
			</p>
		</div>

		<template v-if="localPackage">
			<div
				v-if="localPackage.install_state === PatchState.DOWNLOAD_FAILED"
				class="alert alert-notice"
			>
				<p>
					<app-jolticon icon="notice" />
					<translate>
						Oh no! We couldn't download this package. Perhaps check that you're still
						online?
					</translate>
				</p>
			</div>

			<div
				v-if="localPackage.install_state === PatchState.UNPACK_FAILED"
				class="alert alert-notice"
			>
				<p>
					<app-jolticon icon="notice" />
					<translate>
						Oh no! We couldn't unpack this package after downloading it. Maybe try
						again?
					</translate>
				</p>
			</div>

			<div
				v-if="localPackage.remove_state === RemoveState.REMOVE_FAILED"
				class="alert alert-notice"
			>
				<p>
					<app-jolticon icon="notice" />
					<translate>Oh no! We couldn't remove this package. Maybe try again?</translate>
				</p>
			</div>

			<div v-if="localPackage.isRunning" class="alert alert-highlight">
				<p>
					<app-jolticon icon="play" />
					<translate>
						You are currently running this package. Some options have been disabled
						while it's open.
					</translate>
				</p>
			</div>
		</template>

		<!-- Able to install game -->
		<app-button
			v-if="canInstall && !localPackage"
			primary
			icon="download-box"
			@click="installClick(card.downloadableBuild)"
		>
			<translate>Install</translate>
			<small>({{ formatFilesize(card.downloadableBuild.primary_file.filesize) }})</small>
		</app-button>

		<!-- Game is installing or installed -->
		<template v-if="localPackage">
			<template v-if="localPackage.isPatching">
				<app-expand :when="localPackage.isDownloading || localPackage.isUnpacking">
					<div class="alert">
						<app-client-install-progress :local-package="localPackage" />
					</div>
				</app-expand>

				<template v-if="localPackage.isPatchQueued">
					<span class="tag big">
						<translate>QUEUED</translate>
					</span>
				</template>
				<template v-else>
					<app-button v-if="!localPackage.isPatchPaused" @click="pauseInstall()">
						<translate>Pause</translate>
					</app-button>
					<app-button v-else primary @click="resumeInstall()">
						<translate>Resume</translate>
					</app-button>
				</template>
			</template>

			<!-- Game failed to install -->
			<app-button v-if="localPackage.didInstallFail" primary @click="retryInstall()">
				<translate>Retry Install</translate>
			</app-button>

			<!-- Game failed to update -->
			<app-button v-if="localPackage.didUpdateFail" primary @click="retryInstall()">
				<translate>Retry Update</translate>
			</app-button>

			<!-- Game failed to uninstall -->
			<app-button v-if="localPackage.didRemoveFail" primary @click="retryUninstall()">
				<translate>Retry Uninstall</translate>
			</app-button>

			<!--
				Can only cancel installs, not updates.
			-->
			<app-button
				v-if="localPackage.install_state"
				v-app-tooltip="$gettext('Cancel Installation')"
				circle
				icon="remove"
				trans
				@click="cancelInstall()"
			/>

			<!-- Game is installed -->
			<app-button
				v-if="localPackage.isSettled && !localPackage.isRunning"
				primary
				solid
				icon="play"
				@click="launchPackage()"
			>
				<translate>Launch</translate>
			</app-button>
		</template>

		<!--
			Browser quick play
			We hide this as soon as they install the game.
		-->
		<app-button
			v-else-if="card.browserBuild"
			primary
			icon="play"
			@click="buildClick(card.browserBuild)"
		>
			<translate>Quick Play</translate>
			<app-jolticon icon="addon" :class="`jolticon-${card.showcasedBrowserIcon}`" />
		</app-button>

		<app-popper
			v-if="card.extraBuilds.length || (localPackage && !localPackage.install_state)"
			popover-class="fill-darkest"
		>
			<app-button
				v-app-track-event="`game-package-card:more-options`"
				circle
				icon="ellipsis-v"
				trans
			/>

			<template #popover>
				<div
					v-if="localPackage && (card.browserBuild || localPackage.isSettled)"
					class="more-client-options list-group list-group-dark nowrap"
				>
					<template v-if="localPackage.isSettled">
						<a class="list-group-item has-icon" @click="openFolder()">
							<app-jolticon icon="folder-open" />
							<span v-translate="{ title: localPackage.title || game.title }">
								Open Folder for %{ title }
							</span>
						</a>

						<!--
							In client, if a package is installed, allow them to remove.
						-->
						<a
							:class="{ disabled: localPackage.isRunning }"
							class="list-group-item has-icon warning"
							@click="uninstall()"
						>
							<app-jolticon icon="remove" notice />
							<translate>Uninstall</translate>
						</a>
					</template>

					<!--
						If this game has a quick play web build but is installed, we want
						to show the quick play here now.
					-->
					<template v-else-if="card.browserBuild">
						<a
							class="list-group-item has-icon warning"
							@click="buildClick(card.browserBuild)"
						>
							<app-jolticon icon="html5" />
							<translate>Quick Play</translate>
							<small class="text-muted">
								({{ formatFilesize(card.browserBuild.primary_file.filesize) }})
							</small>
						</a>
					</template>
				</div>

				<!-- The non-client options. -->
				<app-game-package-card-more-options
					:card="card"
					@click="buildClick($event, true)"
				/>
			</template>
		</app-popper>
	</div>
</template>

<style lang="stylus" scoped>
.more-client-options
	margin-bottom: 0
</style>
