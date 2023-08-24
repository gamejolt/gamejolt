<script lang="ts">
import type { Component, PropType } from 'vue';
import { toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { Analytics } from '../../../../_common/analytics/analytics.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import { getDeviceArch, getDeviceOS } from '../../../../_common/device/device.service';
import { GameBuildModel, GameBuildType } from '../../../../_common/game/build/build.model';
import { GameDownloader } from '../../../../_common/game/downloader/downloader.service';
import { GameModel, chooseBestGameBuild } from '../../../../_common/game/game.model';
import type { GamePackageModel } from '../../../../_common/game/package/package.model';
import { GamePackagePurchaseModal } from '../../../../_common/game/package/purchase-modal/purchase-modal.service';
import { GamePlayModal } from '../../../../_common/game/play-modal/play-modal.service';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import type { UserModel } from '../../../../_common/user/user.model';
import { arrayUnique } from '../../../../utils/array';
import AppGameCoverButtonsBuildButtons from './build-buttons.vue';

let buildButtonsComponent: Component = AppGameCoverButtonsBuildButtons;

export function setBuildButtonsComponent(component: Component) {
	buildButtonsComponent = component;
}
</script>

<script lang="ts" setup>
const props = defineProps({
	game: {
		type: Object as PropType<GameModel>,
		required: true,
	},
	packages: {
		type: Array as PropType<GamePackageModel[]>,
		required: true,
	},
	downloadableBuilds: {
		type: Array as PropType<GameBuildModel[]>,
		required: true,
	},
	browserBuilds: {
		type: Array as PropType<GameBuildModel[]>,
		required: true,
	},
	installableBuilds: {
		type: Array as PropType<GameBuildModel[]>,
		required: true,
	},
	partnerKey: {
		type: String,
		default: undefined,
	},
	partner: {
		type: Object as PropType<UserModel>,
		default: undefined,
	},
});

const { game, packages, downloadableBuilds, browserBuilds, installableBuilds } = toRefs(props);

const emit = defineEmits({
	'show-multiple-packages': () => true,
});

const router = useRouter();

function _chooseBuild(builds: GameBuildModel[], defaultBuild?: GameBuildModel) {
	let chosen: GameBuildModel | undefined;

	// Do we have to choose between multiple?
	if (builds.length > 1) {
		const packageIds = arrayUnique(builds.map(item => item.game_package_id));

		// All builds in same package, so choose the default one.
		if (packageIds.length <= 1) {
			if (defaultBuild) {
				chosen = defaultBuild;
			}
		} else {
			// When there's more than one package, we have to give them the
			// option of what to play/download.
			emit('show-multiple-packages');
			return false;
		}
	}

	if (!chosen) {
		chosen = defaultBuild;
	}

	return chosen;
}

function play() {
	Analytics.trackEvent('game-cover-buttons', 'download', 'play');

	// Prioritize HTML build.
	let defaultBuild = browserBuilds.value.find(item => item.type === GameBuildType.Html);

	// If no HTML build, use something else.
	if (!defaultBuild && browserBuilds.value.length) {
		defaultBuild = browserBuilds.value[0];
	}

	const chosenBuild = _chooseBuild(browserBuilds.value, defaultBuild);

	if (chosenBuild) {
		// If the build belongs to a pwyw package, open up the package
		// payment form.
		if (chosenBuild._package!.shouldShowNamePrice()) {
			buy(chosenBuild._package, chosenBuild);
		} else {
			GamePlayModal.show(game.value, chosenBuild);
		}
	}
}

function download() {
	Analytics.trackEvent('game-cover-buttons', 'download', 'download');

	const os = getDeviceOS();
	const arch = getDeviceArch();

	// This will return builds that may not work for this OS, but it's still the "best" to get.
	const defaultBuild = chooseBestGameBuild(downloadableBuilds.value, os, arch);

	// We then try to see within the actual installable builds for this OS, if there are
	// multiple packages we may have to choose from.
	const chosenBuild = _chooseBuild(installableBuilds.value, defaultBuild);
	if (chosenBuild) {
		// If the build belongs to a pwyw package, open up the package
		// payment form.
		if (chosenBuild._package!.shouldShowNamePrice()) {
			buy(chosenBuild._package, chosenBuild);
		} else {
			GameDownloader.download(router, game.value, chosenBuild);
		}
	}
}

function buy(pkg?: GamePackageModel, build?: GameBuildModel) {
	if (!pkg) {
		if (!game.value.sellable) {
			return;
		}
		const sellableId = game.value.sellable.id;

		pkg = packages.value.find(item => {
			if (!item._sellable) {
				return false;
			}

			return item._sellable.id === sellableId;
		});
		if (!pkg) {
			return;
		}
	}

	GamePackagePurchaseModal.show({
		game: game.value,
		package: pkg,
		build: build || null,
		fromExtraSection: false,
	});
}
</script>

<template>
	<div class="game-cover-buttons">
		<!--
			If the primary is for sale and they don't own it yet, the only button we should show is the
			buy button.
		-->
		<AppButton v-if="game._can_buy_primary_sellable" primary @click="buy()">
			<AppTranslate>Buy Game</AppTranslate>
		</AppButton>

		<!--
			If the game is not for sale, or if they own the game, then show the normal buttons.
		-->
		<template v-else>
			<component
				:is="buildButtonsComponent"
				:game="game"
				:downloadable-builds="downloadableBuilds"
				:browser-builds="browserBuilds"
				:installable-builds="installableBuilds"
				@play="play()"
				@download="download()"
			/>
		</template>
	</div>
</template>

<style lang="stylus" scoped>
.game-cover-buttons
	display: block
	position: relative
</style>
