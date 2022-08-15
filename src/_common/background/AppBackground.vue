<script lang="ts" setup>
import { computed, PropType, ref, StyleValue, toRefs, watch } from 'vue';
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
	backgroundStyle: {
		type: Object as PropType<StyleValue>,
		default: undefined,
	},
	fadeOpacity: {
		type: Number,
		default: 0.05,
	},
	/**
	 * Will scroll the background infinitely.
	 */
	scroll: {
		type: Boolean,
	},
});

const { background, darken, bleed, backgroundStyle, fadeOpacity } = toRefs(props);

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
			:style="backgroundStyle"
		>
			<div v-if="background" class="-stretch anim-fade-in">
				<Transition name="fade">
					<div
						v-if="loadedBackground"
						:key="loadedBackground.id"
						:class="[
							'-background-img',
							'-stretch',
							'anim-fade-in',
							{ '-scroll': scroll },
						]"
						:style="{
							backgroundImage: loadedBackground.cssBackgroundImage,
							backgroundRepeat: loadedBackground.cssBackgroundRepeat,
							backgroundSize: loadedBackground.cssBackgroundSize,
							backgroundPosition: loadedBackground.cssBackgroundPosition,
						}"
					/>
				</Transition>

				<template v-if="darken">
					<div class="-fade-top" />
					<div
						class="-stretch"
						:style="{
							backgroundColor: `rgba(0, 0, 0, ${fadeOpacity})`,
						}"
					/>
					<div class="-fade-bottom" />
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

.-background-img.-scroll
	animation-name: anim-scroll
	animation-timing-function: linear !important
	animation-duration: 20s
	animation-iteration-count: infinite

.-fade-top
.-fade-bottom
	position: absolute
	left: 0
	right: 0
	height: calc(min(80px, 50%))
	background-repeat: no-repeat
	background-size: cover

.-fade-top
	top: 0
	background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.25),  rgba(0, 0, 0, 0))
	background-position: top

.-fade-bottom
	bottom: 0
	background-image: linear-gradient(to top, rgba(0, 0, 0, 0.25),  rgba(0, 0, 0, 0))
	background-position: bottom

.-inner
	z-index: 1
	position: relative
	width: 100%
	height: 100%

@keyframes anim-scroll
	0%
		background-position: 0 0

	100%
		background-position: 800px 0
</style>
