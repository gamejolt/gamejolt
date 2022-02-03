<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../../../../utils/vue';
import { Analytics } from '../../../../../_common/analytics/analytics.service';
import { getDeviceArch, getDeviceOS } from '../../../../../_common/device/device.service';
import AppExpand from '../../../../../_common/expand/AppExpand.vue';
import { formatFilesize } from '../../../../../_common/filters/filesize';
import { GameBuild } from '../../../../../_common/game/build/build.model';
import { Game } from '../../../../../_common/game/game.model';
import AppGamePackageCardMoreOptions from '../../../../../_common/game/package/card/AppGamePackageCardMoreOptions.vue';
import { GamePackageCardModel } from '../../../../../_common/game/package/card/card.model';
import { GamePackage } from '../../../../../_common/game/package/package.model';
import { Popper } from '../../../../../_common/popper/popper.service';
import AppPopper from '../../../../../_common/popper/popper.vue';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { useClientLibraryStore } from '../../../../store/client-library/index';
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

	readonly clientLibrary = shallowSetup(() => useClientLibraryStore());

	// @ClientLibraryAction
	// private launcherLaunch!: ClientLibraryStore['launcherLaunch'];
	launcherLaunch!: any;

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
		return this.clientLibrary.packagesById.value[this.package.id];
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

		this.clientLibrary.packageInstall(
			this.game,
			build._package!,
			build._release!,
			build,
			build._launch_options!
		);
	}

	pauseInstall() {
		if (!this.localPackage) {
			throw new Error(`Local package isn't set`);
		}

		Analytics.trackEvent('game-package-card', 'pause-install');
		this.clientLibrary.installerPause(this.localPackage);
	}

	resumeInstall() {
		if (!this.localPackage) {
			throw new Error(`Local package isn't set`);
		}

		Analytics.trackEvent('game-package-card', 'resume-install');
		this.clientLibrary.installerResume(this.localPackage);
	}

	cancelInstall() {
		if (!this.localPackage) {
			throw new Error(`Local package isn't set`);
		}

		Analytics.trackEvent('game-package-card', 'cancel-install');
		this.clientLibrary.packageUninstall(this.localPackage);
	}

	retryInstall() {
		if (!this.localPackage) {
			throw new Error(`Local package isn't set`);
		}

		Analytics.trackEvent('game-package-card', 'retry-install');
		this.clientLibrary.installerRetry(this.localPackage);
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

		const fs = require('fs') as typeof import('fs');
		const path = require('path') as typeof import('path');

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

		this.clientLibrary.packageUninstall(this.localPackage);
	}

	retryUninstall() {
		if (!this.localPackage) {
			throw new Error(`Local package isn't set`);
		}

		Analytics.trackEvent('game-package-card', 'retry-uninstall');
		Popper.hideAll();

		this.clientLibrary.packageUninstall(this.localPackage);
	}
}
</script>

<template>
	<div class="package-card-buttons">
		<!-- Messaging for weird cases... -->
		<div v-if="downloadableUnsupported" class="alert">
			<p>
				<AppJolticon icon="notice" notice />
				<AppTranslate>This package can not be installed on your system.</AppTranslate>
			</p>
		</div>

		<div v-if="downloadableUnsupportedHasQuickPlay" class="alert">
			<p>
				<AppJolticon icon="notice" notice />
				<AppTranslate>
					This package can not be installed on your system, but can be quick played in the
					client.
				</AppTranslate>
			</p>
		</div>

		<template v-if="localPackage">
			<div
				v-if="localPackage.install_state === PatchState.DOWNLOAD_FAILED"
				class="alert alert-notice"
			>
				<p>
					<AppJolticon icon="notice" />
					<AppTranslate>
						Oh no! We couldn't download this package. Perhaps check that you're still
						online?
					</AppTranslate>
				</p>
			</div>

			<div
				v-if="localPackage.install_state === PatchState.UNPACK_FAILED"
				class="alert alert-notice"
			>
				<p>
					<AppJolticon icon="notice" />
					<AppTranslate>
						Oh no! We couldn't unpack this package after downloading it. Maybe try
						again?
					</AppTranslate>
				</p>
			</div>

			<div
				v-if="localPackage.remove_state === RemoveState.REMOVE_FAILED"
				class="alert alert-notice"
			>
				<p>
					<AppJolticon icon="notice" />
					<AppTranslate>
						Oh no! We couldn't remove this package. Maybe try again?
					</AppTranslate>
				</p>
			</div>

			<div v-if="localPackage.isRunning" class="alert alert-highlight">
				<p>
					<AppJolticon icon="play" />
					<AppTranslate>
						You are currently running this package. Some options have been disabled
						while it's open.
					</AppTranslate>
				</p>
			</div>
		</template>

		<!-- Able to install game -->
		<AppButton
			v-if="canInstall && !localPackage"
			primary
			icon="download-box"
			@click="installClick(card.downloadableBuild)"
		>
			<AppTranslate>Install</AppTranslate>
			<small>({{ formatFilesize(card.downloadableBuild.primary_file.filesize) }})</small>
		</AppButton>

		<!-- Game is installing or installed -->
		<template v-if="localPackage">
			<template v-if="localPackage.isPatching">
				<AppExpand :when="localPackage.isDownloading || localPackage.isUnpacking">
					<div class="alert">
						<AppClientInstallProgress :local-package="localPackage" />
					</div>
				</AppExpand>

				<template v-if="localPackage.isPatchQueued">
					<span class="tag big">
						<AppTranslate>QUEUED</AppTranslate>
					</span>
				</template>
				<template v-else>
					<AppButton v-if="!localPackage.isPatchPaused" @click="pauseInstall()">
						<AppTranslate>Pause</AppTranslate>
					</AppButton>
					<AppButton v-else primary @click="resumeInstall()">
						<AppTranslate>Resume</AppTranslate>
					</AppButton>
				</template>
			</template>

			<!-- Game failed to install -->
			<AppButton v-if="localPackage.didInstallFail" primary @click="retryInstall()">
				<AppTranslate>Retry Install</AppTranslate>
			</AppButton>

			<!-- Game failed to update -->
			<AppButton v-if="localPackage.didUpdateFail" primary @click="retryInstall()">
				<AppTranslate>Retry Update</AppTranslate>
			</AppButton>

			<!-- Game failed to uninstall -->
			<AppButton v-if="localPackage.didRemoveFail" primary @click="retryUninstall()">
				<AppTranslate>Retry Uninstall</AppTranslate>
			</AppButton>

			<!--
				Can only cancel installs, not updates.
			-->
			<AppButton
				v-if="localPackage.install_state"
				v-app-tooltip="$gettext('Cancel Installation')"
				circle
				icon="remove"
				trans
				@click="cancelInstall()"
			/>

			<!-- Game is installed -->
			<AppButton
				v-if="localPackage.isSettled && !localPackage.isRunning"
				primary
				solid
				icon="play"
				@click="launchPackage()"
			>
				<AppTranslate>Launch</AppTranslate>
			</AppButton>
		</template>

		<!--
			Browser quick play
			We hide this as soon as they install the game.
		-->
		<AppButton
			v-else-if="card.browserBuild"
			primary
			icon="play"
			@click="buildClick(card.browserBuild)"
		>
			<AppTranslate>Quick Play</AppTranslate>
			<AppJolticon icon="addon" :class="`jolticon-${card.showcasedBrowserIcon}`" />
		</AppButton>

		<AppPopper
			v-if="card.extraBuilds.length || (localPackage && !localPackage.install_state)"
			popover-class="fill-darkest"
		>
			<AppButton
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
							<AppJolticon icon="folder-open" />
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
							<AppJolticon icon="remove" notice />
							<AppTranslate>Uninstall</AppTranslate>
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
							<AppJolticon icon="html5" />
							<AppTranslate>Quick Play</AppTranslate>
							<small class="text-muted">
								({{ formatFilesize(card.browserBuild.primary_file.filesize) }})
							</small>
						</a>
					</template>
				</div>

				<!-- The non-client options. -->
				<AppGamePackageCardMoreOptions :card="card" @click="buildClick($event, true)" />
			</template>
		</AppPopper>
	</div>
</template>

<style lang="stylus" scoped>
.more-client-options
	margin-bottom: 0
</style>
