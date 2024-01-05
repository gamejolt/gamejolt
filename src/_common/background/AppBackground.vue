<script lang="ts" setup>
import { CSSProperties, PropType, computed, ref, toRefs, watch } from 'vue';
import { styleWhen } from '../../_styles/mixins';
import { ImgHelper } from '../img/helper/helper-service';
import AppMediaItemBackdrop from '../media-item/backdrop/AppMediaItemBackdrop.vue';
import AppBackgroundFade from './AppBackgroundFade.vue';
import AppBackgroundImg from './AppBackgroundImg.vue';
import { BackgroundModel } from './background.model';

const props = defineProps({
	background: {
		type: Object as PropType<BackgroundModel>,
		default: undefined,
	},
	darken: {
		type: Boolean,
	},
	bleed: {
		type: Boolean,
	},
	backdropStyle: {
		type: Object as PropType<CSSProperties>,
		default: undefined,
	},
	backgroundStyle: {
		type: Object as PropType<CSSProperties>,
		default: undefined,
	},
	fadeOpacity: {
		type: Number,
		default: undefined,
	},
	/**
	 * Will scroll the background infinitely in the chosen direction.
	 */
	scrollDirection: {
		type: String as PropType<'left' | 'up' | 'right' | 'down'>,
		default: undefined,
	},
	/**
	 * Removes the top/bottom gradients when {@link darken} is true.
	 */
	noEdges: {
		type: Boolean,
	},
	enablePageScroll: {
		type: Boolean,
	},
});

const { background, bleed, backdropStyle, backgroundStyle, scrollDirection } = toRefs(props);

const isLoaded = ref(false);
const loadedBackground = ref<BackgroundModel>();

const mediaItem = computed(() => background?.value?.media_item);
const hasMedia = computed(() => !!mediaItem.value);

if (import.meta.env.SSR) {
	loadedBackground.value = background?.value;
} else {
	watch(
		() => mediaItem.value?.mediaserver_url,
		async imgUrl => {
			if (!imgUrl) {
				loadedBackground.value = undefined;
				return;
			}
			const loadingBackground = background?.value;
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
			:style="backdropStyle"
		>
			<div v-if="background" class="_stretch anim-fade-in">
				<Transition name="fade">
					<AppBackgroundImg
						v-if="loadedBackground"
						:key="loadedBackground.id"
						class="_stretch anim-fade-in"
						:background-style="
							styleWhen(!!backgroundStyle, backgroundStyle!)
						"
						:background="background"
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
	position: absolute
	z-index: 0
	left: var(--background-pos)
	top: var(--background-pos)
	right: var(--background-pos)
	bottom: var(--background-pos)
	width: unset
	height: unset

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
