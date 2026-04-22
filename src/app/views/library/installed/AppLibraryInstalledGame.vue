<script lang="ts" setup>
import { computed, ref } from 'vue';

import AppClientGameButtons from '~app/components/client/game-buttons/AppClientGameButtons.vue';
import { LocalDbGame } from '~app/components/client/local-db/game/game.model';
import { useClientLibraryStore } from '~app/store/client-library/index';
import AppGameThumbnail from '~common/game/thumbnail/AppGameThumbnail.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';

type Props = {
	game: LocalDbGame;
};
const { game } = defineProps<Props>();

const { packagesByGameId, packages } = useClientLibraryStore();

const isHovering = ref(false);
const isShowingOptions = ref(false);
const isShowingLaunchOptions = ref(false);

const hasMultiplePackages = computed(() => {
	const len = packagesByGameId.value[game.id]?.length ?? 0;
	return len > 1;
});

const packageVersion = computed(() => {
	const firstPackage = packagesByGameId.value[game.id]?.[0] ?? null;
	return firstPackage?.release.version_number ?? '0.0.0';
});

const isInstalling = computed(() => {
	return packages.value.some(i => !!i.install_state && i.game_id === game.id);
});

const isUpdating = computed(() => {
	return packages.value.some(i => !!i.update_state && i.game_id === game.id);
});

const shouldShowControls = computed(() => {
	return (
		isHovering.value ||
		isShowingOptions.value ||
		isShowingLaunchOptions.value ||
		isInstalling.value ||
		isUpdating.value
	);
});
</script>

<template>
	<div
		class="client-installed-game"
		:class="{
			'-is-installing': isInstalling,
			'-is-active': isShowingOptions || isShowingLaunchOptions,
		}"
		@mouseenter="isHovering = true"
		@mouseleave="isHovering = false"
	>
		<AppGameThumbnail class="-thumb" :game="game._game" hide-pricing />

		<div v-if="shouldShowControls" class="-meta-outer">
			<div class="-meta">
				<AppClientGameButtons
					:game="game._game"
					overlay
					can-install
					@show-options="isShowingOptions = true"
					@hide-options="isShowingOptions = false"
					@show-launch-options="isShowingLaunchOptions = true"
					@hide-launch-options="isShowingLaunchOptions = false"
				/>

				<span class="-version">
					<template v-if="!hasMultiplePackages">
						{{ packageVersion }}
					</template>
					<template v-else>
						<AppTranslate>Multiple Packages</AppTranslate>
					</template>
				</span>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.client-installed-game
	position: relative

	:deep(img)
	:deep(video)
		transition: all 1s
		filter: grayscale(0)

	&.-is-installing
		:deep(img)
		:deep(video)
			filter: grayscale(100%)

.-thumb
	position: relative
	z-index: 1

// This matches the thumbnail ratio.
.-meta-outer
	position: absolute
	top: 0
	left: 0
	right: 0
	height: 0
	padding-top: 56.25% // HD 16:9

.-meta
	rounded-corners-lg()
	position: absolute
	top: 0
	left: 0
	right: 0
	bottom: 0
	align-items: center
	display: flex
	text-align: center
	background-color: rgba(0, 0, 0, 0.5)
	z-index: 2

	:deep(.client-game-buttons)
		display: block
		width: 100%

	:deep(.client-install-progress)
		rounded-corners()
		margin: 0
		margin-left: ($grid-gutter-width / 2)
		margin-right: ($grid-gutter-width / 2)
		margin-bottom: 5px
		padding: 2px 10px
		background-color: rgba($black, 0.7)
		color: $white

		p
		.progress
			margin: 5px 0
			font-size: $font-size-tiny

.-version
	theme-prop('background', 'darkest')
	position: absolute
	bottom: 0
	right: ($grid-gutter-width / 2)
	color: $white
	padding: 5px 10px
	font-size: $font-size-tiny
	border-top-left-radius: $border-radius-large
	border-top-right-radius: $border-radius-large
</style>
