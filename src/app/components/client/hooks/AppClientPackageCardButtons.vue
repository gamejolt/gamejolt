<script lang="ts" setup>
import { computed } from 'vue';

import AppClientInstallProgress from '~app/components/client/AppClientInstallProgress.vue';
import {
	LocalDbPackagePatchState,
	LocalDbPackageRemoveState,
} from '~app/components/client/local-db/package/package.model';
import { useClientLibraryStore } from '~app/store/client-library/index';
import AppButton from '~common/button/AppButton.vue';
import AppExpand from '~common/expand/AppExpand.vue';
import { formatFilesize } from '~common/filters/filesize';
import {
	canInstallGameBuild,
	type GameBuildModel,
	GameBuildTypeHtml,
	GameBuildTypeRom,
} from '~common/game/build/build.model';
import { GameModel } from '~common/game/game.model';
import AppGamePackageCardMoreOptions from '~common/game/package/card/AppGamePackageCardMoreOptions.vue';
import { GamePackageCardModel } from '~common/game/package/card/card.model';
import { GamePackageModel } from '~common/game/package/package.model';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import AppPopper from '~common/popper/AppPopper.vue';
import { hideAllPoppers } from '~common/popper/popper.service';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { TranslateDirective as vTranslate } from '~common/translate/translate-directive';

type Props = {
	game: GameModel;
	package: GamePackageModel;
	card: GamePackageCardModel;
};
const { game, package: pkg, card } = defineProps<Props>();

const emit = defineEmits<{
	click: [data: { build: GameBuildModel; fromExtraSection?: boolean }];
	'show-build-payment': [build: GameBuildModel];
}>();

const {
	packagesById,
	packageInstall,
	packageUninstall,
	installerPause,
	installerResume,
	installerRetry,
	launcherLaunch,
} = useClientLibraryStore();

const localPackage = computed(() => packagesById.value[pkg.id]);

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

	packageInstall(game, build._package!, build._release!, build, build._launch_options!);
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

	hideAllPoppers();

	packageUninstall(localPackage.value);
}

function retryUninstall() {
	if (!localPackage.value) {
		throw new Error(`Local package isn't set`);
	}

	hideAllPoppers();

	packageUninstall(localPackage.value);
}

// If the browser build isn't an HTML/ROM build, then it can't be quick played
// in the desktop app. It might be playable in the browser tho.
//
// TODO(game-build-installers) this is extremely silly. put this logic in card model.
if (
	card.browserBuild &&
	card.browserBuild.type !== GameBuildTypeHtml &&
	card.browserBuild.type !== GameBuildTypeRom
) {
	const _build = card.browserBuild;

	card.extraBuilds.unshift({
		type: _build.type,
		icon: card.platformSupportInfo[_build.type].icon,
		build: _build,
		platform: _build.type,
		arch: null,
	});

	// Clear out the browser build since it's not quick playable.

	card.browserBuild = null;
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
	if (card.primaryAction === 'install') {
		return BuildCapability.Installable;
	} else if (card.browserBuild) {
		return BuildCapability.QuickPlayable;
	} else if (card.primaryIsCompatible) {
		return BuildCapability.Runnable;
	} else if (card.primaryBuild) {
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
