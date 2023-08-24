<script lang="ts" setup>
import { computed, PropType, ref, StyleValue, toRefs, watch } from 'vue';
import { kStrongEaseOut } from '../../_styles/variables';
import { ImgHelper } from '../img/helper/helper-service';
import AppMediaItemBackdrop from '../media-item/backdrop/AppMediaItemBackdrop.vue';
import { Background } from './background.model';

const props = defineProps({
	background: {
		type: Object as PropType<Background>,
		default: undefined,
	},
	darken: {
		type: Boolean,
	},
	bleed: {
		type: Boolean,
	},
	backdropStyle: {
		type: Object as PropType<StyleValue>,
		default: undefined,
	},
	backgroundStyle: {
		type: Object as PropType<StyleValue>,
		default: undefined,
	},
	fadeOpacity: {
		type: Number,
		default: 0.1,
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
});

const { background, darken, bleed, backdropStyle, backgroundStyle, fadeOpacity, scrollDirection } =
	toRefs(props);

const mediaItem = computed(() => background?.value?.media_item);
const hasMedia = computed(() => !!mediaItem.value);

const isLoaded = ref(false);

const loadedBackground = ref<Background>();

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
	<div class="-background">
		<AppMediaItemBackdrop
			v-if="hasMedia"
			:media-item="mediaItem"
			class="-backdrop"
			:class="{ '-bleed': bleed }"
			:style="backdropStyle"
		>
			<div v-if="background" class="-stretch anim-fade-in">
				<Transition name="fade">
					<div
						v-if="loadedBackground"
						:key="loadedBackground.id"
						:class="[
							'-stretch',
							'anim-fade-in',
							{
								'-scroll': scrollDirection,
								[`-scroll-${scrollDirection}`]: scrollDirection,
							},
						]"
						:style="[
							{
								backgroundImage: loadedBackground.cssBackgroundImage,
								backgroundRepeat: loadedBackground.cssBackgroundRepeat,
								backgroundSize: loadedBackground.cssBackgroundSize,
								backgroundPosition: loadedBackground.cssBackgroundPosition,
							},
							backgroundStyle || {},
						]"
					/>
				</Transition>

				<template v-if="darken">
					<div v-if="!noEdges" class="-fade-top" />
					<div
						class="-stretch"
						:style="{
							backgroundColor: `rgba(0, 0, 0, ${fadeOpacity})`,
							transition: `background-color 300ms ${kStrongEaseOut}`,
						}"
					/>
					<div v-if="!noEdges" class="-fade-bottom" />
				</template>
			</div>
		</AppMediaItemBackdrop>

		<div class="-inner" :class="{ '-active': hasMedia }">
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-background
	position: relative

.-backdrop
	--background-pos: 0
	position: absolute
	z-index: 0
	left: var(--background-pos)
	top: var(--background-pos)
	right: var(--background-pos)
	bottom: var(--background-pos)
	width: unset
	height: unset

.-bleed
	--background-pos: -($grid-gutter-width-xs / 2 + $border-width-base)

	@media $media-md-up
		--background-pos: -($grid-gutter-width / 2 + $border-width-base)

.-stretch
	position: absolute
	left: 0
	top: 0
	right: 0
	bottom: 0

.-scroll
	animation-timing-function: linear !important
	animation-duration: 20s
	animation-iteration-count: infinite

.-scroll-left
.-scroll-right
	animation-name: anim-scroll-h

.-scroll-up
.-scroll-down
	animation-name: anim-scroll-v

.-scroll-left
.-scroll-down
	animation-direction: reverse

.-fade-top
.-fade-bottom
	position: absolute
	left: 0
	right: 0
	height: 150px
	max-height: 100%
	background-repeat: no-repeat
	background-size: cover

.-fade-top
	top: 0
	background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.3),  rgba(0, 0, 0, 0))
	background-position: top

.-fade-bottom
	bottom: 0
	background-image: linear-gradient(to top, rgba(0, 0, 0, 0.3),  rgba(0, 0, 0, 0))
	background-position: bottom

.-inner
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
