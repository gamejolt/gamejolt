<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import AppButton from '../../../../_common/button/AppButton.vue';
import AppExpand from '../../../../_common/expand/AppExpand.vue';
import { formatFilesize } from '../../../../_common/filters/filesize';
import {
	canInstallGameBuild,
	GameBuildType,
	type GameBuildModel,
} from '../../../../_common/game/build/build.model';
import { GameModel } from '../../../../_common/game/game.model';
import AppGamePackageCardMoreOptions from '../../../../_common/game/package/card/AppGamePackageCardMoreOptions.vue';
import { GamePackageCardModel } from '../../../../_common/game/package/card/card.model';
import { GamePackageModel } from '../../../../_common/game/package/package.model';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppPopper from '../../../../_common/popper/AppPopper.vue';
import { Popper } from '../../../../_common/popper/popper.service';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { useClientLibraryStore } from '../../../store/client-library/index';
import AppClientInstallProgress from '../AppClientInstallProgress.vue';
import {
	LocalDbPackagePatchState,
	LocalDbPackageRemoveState,
} from '../local-db/package/package.model';

const props = defineProps({
	game: {
		type: Object as PropType<GameModel>,
		required: true,
	},
	package: {
		type: Object as PropType<GamePackageModel>,
		required: true,
	},
	card: {
		type: Object as PropType<GamePackageCardModel>,
		required: true,
	},
});

const { game, package: pkg, card } = toRefs(props);

const emit = defineEmits({
	click: (_data: { build: GameBuildModel; fromExtraSection?: boolean }) => true,
	'show-build-payment': (_build: GameBuildModel) => true,
});

const {
	packagesById,
	packageInstall,
	packageUninstall,
	installerPause,
	installerResume,
	installerRetry,
	launcherLaunch,
} = useClientLibraryStore();

const localPackage = computed(() => packagesById.value[pkg.value.id]);

function buildClick(build: GameBuildModel, fromExtraSection?: boolean) {
	emit('click', { build, fromExtraSection });
}

function installClick(build: GameBuildModel) {
	if (build._package!.shouldShowNamePrice()) {
		emit('show-build-payment', build);
		return;
	}

	startInstall(build);
}

function startInstall(build: GameBuildModel) {
	// Sanity check.
	if (!canInstallGameBuild({ build })) {
		throw new Error(`Attempted to install a non installable build ${build.id}`);
	}

	packageInstall(game.value, build._package!, build._release!, build, build._launch_options!);
}

function pauseInstall() {
	if (!localPackage.value) {
		throw new Error(`Local package isn't set`);
	}

	installerPause(localPackage.value);
}

function resumeInstall() {
	if (!localPackage.value) {
		throw new Error(`Local package isn't set`);
	}

	installerResume(localPackage.value);
}

function cancelInstall() {
	if (!localPackage.value) {
		throw new Error(`Local package isn't set`);
	}

	packageUninstall(localPackage.value);
}

function retryInstall() {
	if (!localPackage.value) {
		throw new Error(`Local package isn't set`);
	}

	installerRetry(localPackage.value);
}

function launchPackage() {
	if (!localPackage.value) {
		throw new Error(`Local package isn't set`);
	}

	launcherLaunch(localPackage.value);
}

function openFolder() {
	if (!localPackage.value) {
		throw new Error(`Local package isn't set`);
	}

	const fs = require('fs') as typeof import('fs');
	const path = require('path') as typeof import('path');

	fs.readdir(path.resolve(localPackage.value.install_dir), (err, files) => {
		if (err || !localPackage.value) {
			return;
		}

		// Just open the first file in the folder.
		// This way we open within the package folder instead of the parent folder.
		nw.Shell.showItemInFolder(path.resolve(localPackage.value.install_dir, files[0]));
	});
}

function uninstall() {
	// Can't if the package is running.
	if (!localPackage.value || localPackage.value.isRunning) {
		return;
	}

	Popper.hideAll();

	packageUninstall(localPackage.value);
}

function retryUninstall() {
	if (!localPackage.value) {
		throw new Error(`Local package isn't set`);
	}

	Popper.hideAll();

	packageUninstall(localPackage.value);
}

// If the browser build isn't an HTML/ROM build, then it can't be quick played
// in the desktop app. It might be playable in the browser tho.
//
// TODO(game-build-installers) this is extremely silly. put this logic in card model.
if (
	card.value.browserBuild &&
	card.value.browserBuild.type !== GameBuildType.Html &&
	card.value.browserBuild.type !== GameBuildType.Rom
) {
	const _build = card.value.browserBuild;

	card.value.extraBuilds.unshift({
		type: _build.type,
		icon: card.value.platformSupportInfo[_build.type].icon,
		build: _build,
		platform: _build.type,
		arch: null,
	});

	// Clear out the browser build since it's not quick playable.
	card.value.browserBuild = null;
}

// This sets up proper messaging for what you can or cannot do with the build.
enum BuildCapability {
	Installable,
	QuickPlayable,
	Runnable,
	Unsupported,
	NonExistant,
}

const buildCapability = computed(() => {
	if (card.value.primaryAction === 'install') {
		return BuildCapability.Installable;
	} else if (card.value.browserBuild) {
		return BuildCapability.QuickPlayable;
	} else if (card.value.primaryIsCompatible) {
		return BuildCapability.Runnable;
	} else if (card.value.primaryBuild) {
		return BuildCapability.Unsupported;
	} else {
		return BuildCapability.NonExistant;
	}
});
</script>

<template>
	<div class="package-card-buttons">
		<!-- Messaging for weird cases... -->
		<div v-if="buildCapability === BuildCapability.Unsupported" class="alert">
			<p>
				<AppJolticon icon="notice" notice />
				<AppTranslate>This package is not supported on your system.</AppTranslate>
			</p>
		</div>

		<div v-else-if="buildCapability === BuildCapability.Runnable" class="alert">
			<p>
				<AppJolticon icon="notice" notice />
				<AppTranslate>
					This package can not be installed from the Desktop App, but may work if you
					download it
				</AppTranslate>
			</p>
		</div>

		<div v-else-if="buildCapability === BuildCapability.QuickPlayable" class="alert">
			<p>
				<AppJolticon icon="notice" notice />
				<AppTranslate>
					This package can not be installed on your system, but you can quick play it
				</AppTranslate>
			</p>
		</div>

		<template v-if="localPackage">
			<div
				v-if="localPackage.install_state === LocalDbPackagePatchState.DOWNLOAD_FAILED"
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
				v-if="localPackage.install_state === LocalDbPackagePatchState.UNPACK_FAILED"
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
				v-if="localPackage.remove_state === LocalDbPackageRemoveState.REMOVE_FAILED"
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
			v-if="card.primaryAction === 'install' && card.primaryBuild && !localPackage"
			primary
			icon="download-box"
			@click="installClick(card.primaryBuild)"
		>
			<AppTranslate>Install</AppTranslate>
			<small>({{ formatFilesize(card.primaryBuild.primary_file.filesize) }})</small>
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
			@click="buildClick(card.browserBuild!)"
		>
			<AppTranslate>Quick Play</AppTranslate>
			<AppJolticon :icon="card.showcasedBrowserIcon" />
		</AppButton>

		<AppPopper
			v-if="card.extraBuilds.length || (localPackage && !localPackage.install_state)"
			popover-class="fill-darkest"
		>
			<AppButton class="more-client-options-btn" circle icon="ellipsis-v" trans />

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
							@click="buildClick(card.browserBuild!)"
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
.more-client-options-btn
	margin-left: 4px

.more-client-options
	margin-bottom: 0
</style>
