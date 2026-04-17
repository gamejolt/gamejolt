<script lang="ts" setup>
import { computed, CSSProperties, ref, watch } from 'vue';

import AppBackgroundFade from '~common/background/AppBackgroundFade.vue';
import AppBackgroundImg from '~common/background/AppBackgroundImg.vue';
import { BackgroundModel } from '~common/background/background.model';
import { ImgHelper } from '~common/img/helper/helper-service';
import AppMediaItemBackdrop from '~common/media-item/backdrop/AppMediaItemBackdrop.vue';

type Props = {
	background?: BackgroundModel;
	darken?: boolean;
	bleed?: boolean;
	backdropStyle?: CSSProperties;
	backgroundStyle?: CSSProperties;
	fadeOpacity?: number;
	/**
	 * Will scroll the background infinitely in the chosen direction.
	 */
	scrollDirection?: 'left' | 'up' | 'right' | 'down';
	/**
	 * Removes the top/bottom gradients when {@link darken} is true.
	 */
	noEdges?: boolean;
	enablePageScroll?: boolean;
};
const {
	background,
	darken,
	bleed,
	backdropStyle,
	backgroundStyle,
	fadeOpacity,
	scrollDirection,
	noEdges,
	enablePageScroll,
} = defineProps<Props>();

const isLoaded = ref(false);
const loadedBackground = ref<BackgroundModel>();

const mediaItem = computed(() => background?.media_item);
const hasMedia = computed(() => !!mediaItem.value);

if (import.meta.env.SSR) {
	loadedBackground.value = background;
} else {
	watch(
		() => mediaItem.value?.mediaserver_url,
		async imgUrl => {
			if (!imgUrl) {
				loadedBackground.value = undefined;
				return;
			}
			const loadingBackground = background;
			isLoaded.value = false;
			await ImgHelper.loaded(imgUrl);
			isLoaded.value = true;
			loadedBackground.value = loadingBackground;
		},
		{ immediate: true }
	);
}
</script>

<template>
	<div class="AppBackground">
		<AppMediaItemBackdrop
			v-if="hasMedia"
			:media-item="mediaItem"
			class="_backdrop"
			:class="{ _bleed: bleed }"
			:style="[
				backdropStyle,
				{
					position: `absolute`,
					zIndex: 0,
					width: `unset`,
					height: `unset`,
				},
			]"
		>
			<div v-if="background" class="_stretch anim-fade-in">
				<Transition name="fade">
					<AppBackgroundImg
						v-if="loadedBackground"
						:key="loadedBackground.id"
						class="_stretch anim-fade-in"
						:background="background"
						:background-style="backgroundStyle"
						:scroll-direction="scrollDirection"
						:enable-page-scroll="enablePageScroll"
					/>
				</Transition>

				<AppBackgroundFade v-if="darken" :fade-opacity="fadeOpacity" :no-edges="noEdges" />
			</div>
		</AppMediaItemBackdrop>

		<div class="_inner" :class="{ '-active': hasMedia }">
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.AppBackground
	position: relative

._backdrop
	--background-pos: 0
	left: var(--background-pos)
	top: var(--background-pos)
	right: var(--background-pos)
	bottom: var(--background-pos)

._bleed
	--background-pos: -($grid-gutter-width-xs / 2 + $border-width-base)

	@media $media-md-up
		--background-pos: -($grid-gutter-width / 2 + $border-width-base)

._stretch
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0


._inner
	z-index: 1
	position: relative
	width: 100%
	height: 100%
</style>
