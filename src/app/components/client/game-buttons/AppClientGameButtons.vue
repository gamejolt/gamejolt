<script lang="ts" setup>
import { PropType, computed, ref, toRefs, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { Analytics } from '../../../../_common/analytics/analytics.service';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import { getDeviceArch, getDeviceOS } from '../../../../_common/device/device.service';
import {
	GameModel,
	chooseBestGameBuild,
	pluckInstallableGameBuilds,
} from '../../../../_common/game/game.model';
import { GamePackagePayloadModel } from '../../../../_common/game/package/package-payload.model';
import { showGamePackagePurchaseModal } from '../../../../_common/game/package/purchase-modal/purchase-modal.service';
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppPopper from '../../../../_common/popper/AppPopper.vue';
import { Popper } from '../../../../_common/popper/popper.service';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../_common/translate/translate.service';
import { arrayGroupBy } from '../../../../utils/array';
import { useClientLibraryStore } from '../../../store/client-library';
import AppClientInstallProgress from '../AppClientInstallProgress.vue';
import { showClientInstallPackageModal } from '../install-package-modal/install-package-modal.service';
import { LocalDbPackage } from '../local-db/package/package.model';

const props = defineProps({
	game: {
		type: Object as PropType<GameModel>,
		required: true,
	},
	overlay: {
		type: Boolean,
	},
	small: {
		type: Boolean,
	},
	large: {
		type: Boolean,
	},
	label: {
		type: String,
		default: undefined,
	},
	canInstall: {
		type: Boolean,
	},
	noProgress: {
		type: Boolean,
	},
});

const emit = defineEmits({
	'show-launch-options': () => true,
	'hide-launch-options': () => true,
	'show-options': () => true,
	'hide-options': () => true,
});

const { game, canInstall } = toRefs(props);

const {
	findPackageToRepresentGameStatus,
	packagesByGameId,
	packageInstall,
	packageUninstall,
	installerPause,
	installerResume,
	installerRetry,
	launcherLaunch,
} = useClientLibraryStore();

const isLoadingPackageData = ref(false);
const packageDataPromise = ref<Promise<GamePackagePayloadModel> | null>(null);

watch(game, () => {
	isLoadingPackageData.value = false;
	packageDataPromise.value = null;
});

// We try to pull a package with some action on it.
// For example, if a package is installing, we want to pull that one to show.
const localPackage = computed(() => findPackageToRepresentGameStatus(game.value.id));
const gamePackages = computed(() => packagesByGameId.value[game.value.id] || []);
const settledGamePackages = computed(() => gamePackages.value.filter(p => p.isSettled));
const uninstallableGamePackages = computed(() =>
	gamePackages.value.filter(p => !p.install_state && !p.isRemoving)
);

const installTooltip = computed(() => {
	if (!canInstall.value) {
		return $gettext(`This game is not available for installing on your OS.`);
	}
});

const os = computed(() => getDeviceOS());
const arch = computed(() => getDeviceArch());

async function install() {
	Analytics.trackEvent('client-game-buttons', 'install');

	if (!packageDataPromise.value) {
		packageDataPromise.value = fetchPackageData();
	}

	const packageData = await packageDataPromise.value;
	const byPackageId = arrayGroupBy(packageData.installableBuilds!, 'game_package_id');
	// If more than one package for their OS, then we have to show an install package modal.
	if (Object.keys(byPackageId).length > 1) {
		showClientInstallPackageModal(game.value);
		return;
	}

	const build = chooseBestGameBuild(packageData.installableBuilds!, os.value!, arch.value);

	// If the build belongs to a pwyw package, open up the package
	// payment form.
	if (build._package!.shouldShowNamePrice()) {
		showGamePackagePurchaseModal({
			game: game.value,
			package: build._package!,
			build: build,
			fromExtraSection: false,
		});
		return;
	}

	return packageInstall(
		game.value,
		build._package!,
		build._release!,
		build,
		build._launch_options!
	);
}

async function fetchPackageData() {
	const payload = await Api.sendRequest('/web/discover/games/packages/' + game.value.id);

	const packageData = new GamePackagePayloadModel(payload);
	packageData.installableBuilds = pluckInstallableGameBuilds({
		packages: packageData.packages,
		os: os.value!,
		arch: arch.value,
	});

	return packageData;
}

function pause() {
	if (!localPackage.value) {
		return;
	}

	Analytics.trackEvent('client-game-buttons', 'pause-install');
	installerPause(localPackage.value);
}

function resume() {
	if (!localPackage.value) {
		return;
	}

	Analytics.trackEvent('client-game-buttons', 'resume-install');
	installerResume(localPackage.value);
}

function cancel() {
	if (!localPackage.value) {
		return;
	}

	Analytics.trackEvent('client-game-buttons', 'cancel-install');
	packageUninstall(localPackage.value);
}

function retryInstall() {
	if (!localPackage.value) {
		return;
	}

	Analytics.trackEvent('client-game-buttons', 'retry-install');
	installerRetry(localPackage.value);
}

function launch(localPackage: LocalDbPackage) {
	// If already running, do nothing.
	if (localPackage.isRunning) {
		return;
	}

	Analytics.trackEvent('client-game-buttons', 'launch');
	Popper.hideAll();
	return launcherLaunch(localPackage);
}

function openFolder(localPackage: LocalDbPackage) {
	const fs = require('fs') as typeof import('fs');
	const path = require('path') as typeof import('path');

	fs.readdir(path.resolve(localPackage.install_dir), function (err, files) {
		if (err) {
			return;
		}

		// Just open the first file in the folder.
		// This way we open within the package folder instead of the parent folder.
		nw.Shell.showItemInFolder(path.resolve(localPackage.install_dir, files[0]));
	});
}

async function uninstallPackage(localPackage: LocalDbPackage) {
	// If running, do nothing.
	if (localPackage.isRunning) {
		return;
	}

	Analytics.trackEvent('client-game-buttons', 'uninstall');
	Popper.hideAll();

	await packageUninstall(localPackage);
}
</script>

<template>
	<span class="client-game-buttons">
		<span v-if="!localPackage" v-app-tooltip="installTooltip" style="display: inline-block">
			<AppButton
				primary
				solid
				icon="download-box"
				:disabled="!canInstall"
				:overlay="overlay"
				:sm="small"
				:lg="large"
				@click.stop="install()"
			>
				{{ $gettext(`Install`) }}
			</AppButton>
		</span>

		<template v-else>
			<!-- If we're installing -->
			<span v-if="localPackage.install_state || localPackage.update_state">
				<template v-if="localPackage.didInstallFail || localPackage.didUpdateFail">
					<span class="tag tag-notice">
						{{
							localPackage.didInstallFail
								? $gettext('Installation Failed')
								: $gettext('Update Failed')
						}}
					</span>
					<AppButton
						primary
						:overlay="overlay"
						:sm="small"
						:lg="large"
						@click.stop="retryInstall()"
					>
						{{ $gettext(`Retry`) }}
					</AppButton>
				</template>

				<AppClientInstallProgress v-if="!noProgress" :local-package="localPackage" />

				<template v-if="localPackage.isPatching">
					<template v-if="localPackage.isPatchQueued">
						<div class="tag">
							{{ $gettext(`QUEUED`) }}
						</div>
					</template>

					<template v-else-if="localPackage.isUpdating">
						<div class="tag tag-highlight">
							{{ $gettext(`UPDATING`) }}
						</div>
					</template>

					<template v-else-if="!localPackage.isPatchQueued">
						<template v-if="!localPackage.isPatchPaused">
							<AppButton
								:overlay="overlay"
								:sm="small"
								:lg="large"
								@click.stop="pause()"
							>
								<div v-if="!small">
									{{ $gettext(`Pause`) }}
								</div>
							</AppButton>
						</template>

						<template v-else>
							<AppButton
								primary
								:overlay="overlay"
								:sm="small"
								:lg="large"
								@click.stop="resume()"
							>
								<div v-if="!small">
									{{ $gettext(`Resume`) }}
								</div>
							</AppButton>
						</template>
					</template>
				</template>

				<AppButton
					v-if="localPackage.install_state"
					v-app-tooltip="$gettext('Cancel Installation')"
					circle
					icon="remove"
					:trans="!overlay"
					:overlay="overlay"
					:sm="small"
					:lg="large"
					@click.stop="cancel()"
				/>
			</span>

			<span v-if="localPackage.isSettled">
				<!-- Single game launching. -->
				<template v-if="gamePackages.length === 1">
					<AppButton
						v-if="!localPackage.isRunning"
						v-app-tooltip="
							localPackage.isRunning
								? $gettext(`This game is currently running.`)
								: undefined
						"
						primary
						solid
						icon="play"
						:overlay="overlay"
						:sm="small"
						:lg="large"
						@click.stop="launch(localPackage!)"
					>
						{{ $gettext(`Launch`) }}
					</AppButton>
				</template>

				<!-- Multi game launching. -->
				<AppPopper
					v-if="gamePackages.length > 1"
					popover-class="fill-darkest"
					@show="emit('show-launch-options')"
					@hide="emit('hide-launch-options')"
				>
					<AppButton primary solid icon="play" :overlay="overlay" :sm="small" :lg="large">
						{{ $gettext(`Launch`) }}
					</AppButton>

					<template #popover>
						<div class="list-group list-group-dark thin">
							<a
								v-for="pkg of settledGamePackages"
								:key="`launch-${pkg.id}`"
								class="list-group-item has-icon"
								:class="{
									disabled: pkg.isRunning,
								}"
								@click="launch(pkg)"
							>
								<AppJolticon icon="play" />
								{{ pkg.title || game.title }}
							</a>
						</div>
					</template>
				</AppPopper>
			</span>

			<AppPopper
				v-if="!localPackage.install_state"
				class="fill-darkest"
				@show="emit('show-options')"
				@hide="emit('hide-options')"
			>
				<AppButton
					circle
					icon="ellipsis-v"
					:trans="!overlay"
					:overlay="overlay"
					:sm="small"
					:lg="large"
				/>

				<template #popover>
					<div class="list-group list-group-dark thin">
						<RouterLink
							class="list-group-item has-icon"
							:to="{
								name: 'discover.games.view.overview',
								params: {
									slug: game.slug,
									id: game.id,
								},
							}"
						>
							<AppJolticon icon="gamepad" />
							{{ $gettext(`View Game`) }}
						</RouterLink>
						<a
							v-for="pkg of settledGamePackages"
							:key="`open-folder-${pkg.id}`"
							class="list-group-item has-icon"
							@click="openFolder(pkg)"
						>
							<AppJolticon icon="folder-open" />
							{{
								$gettext(`Open Folder for %{ title }`, {
									title: pkg.title || game.title,
								})
							}}
						</a>
						<a
							v-for="pkg of uninstallableGamePackages"
							:key="`uninstall-${pkg.id}`"
							class="list-group-item has-icon"
							:class="{
								disabled: pkg.isRunning,
							}"
							@click="uninstallPackage(pkg)"
						>
							<AppJolticon icon="remove" notice />
							{{
								$gettext(`Uninstall %{ title }`, {
									title: pkg.title || game.title,
								})
							}}
						</a>
					</div>
				</template>
			</AppPopper>
		</template>
	</span>
</template>
