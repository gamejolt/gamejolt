<script lang="ts" setup>
import { CSSProperties, PropType, computed, ref, toRefs, watch } from 'vue';
import { styleWhen } from '../../_styles/mixins';
import { ImgHelper } from '../img/helper/helper-service';
import AppMediaItemBackdrop from '../media-item/backdrop/AppMediaItemBackdrop.vue';
import { Scroll } from '../scroll/scroll.service';
import AppBackgroundFade from './AppBackgroundFade.vue';
import { BackgroundModel, getBackgroundCSSProperties } from './background.model';

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
	pageY: {
		type: Number,
		default: 0,
	},
});

const { background, bleed, backdropStyle, backgroundStyle, scrollDirection, pageY } = toRefs(props);

const isLoaded = ref(false);
const loadedBackground = ref<BackgroundModel>();

const mediaItem = computed(() => background?.value?.media_item);
const hasMedia = computed(() => !!mediaItem.value);
const cssProperties = computed(() => {
	const bg = loadedBackground.value;
	if (!bg) {
		return {};
	}

	const baseStyles = getBackgroundCSSProperties(bg);
	const result = {
		...baseStyles,
		transition: undefined as string | undefined,
	} satisfies CSSProperties;

	if (pageY.value < -1 || pageY.value > 1) {
		const position = pageY.value / 8;
		const time = Scroll.onScrollTimeout + 50;
		result.transition = `background-position ${time}ms cubic-bezier(0.35, 0.91, 0.33, 0.97)`;
		result.backgroundPosition = `center ${position}px`;
	}

	return result;
});

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
					<div
						v-if="loadedBackground"
						:key="loadedBackground.id"
						:class="[
							'_stretch',
							'anim-fade-in',
							{
								_scroll: scrollDirection,
								[`_scroll-${scrollDirection}`]: scrollDirection,
							},
						]"
						:style="[
							cssProperties,
							styleWhen(!!backgroundStyle, backgroundStyle!)
						]"
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

._scroll
	animation-timing-function: linear !important
	animation-duration: 20s
	animation-iteration-count: infinite

._scroll-left
._scroll-right
	animation-name: anim-scroll-h

._scroll-up
._scroll-down
	animation-name: anim-scroll-v

._scroll-left
._scroll-down
	animation-direction: reverse

._inner
	z-index: 1
	position: relative
	width: 100%
	height: 100%

@keyframes anim-scroll-h
	0%
		background-position: 0 0

	100%
		background-position: 800px 0

@keyframes anim-scroll-v
	0%
		background-position: 0 0

	100%
		background-position: 0 -800px
</style>
