<script lang="ts" setup>
import { computed, PropType, ref, StyleValue, watch } from 'vue';
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
});

const mediaItem = computed(() => props.background?.media_item);
const hasMedia = computed(() => !!mediaItem.value);

const isLoaded = ref(false);

if (!import.meta.env.SSR) {
	watch(
		() => mediaItem.value?.mediaserver_url,
		async imgUrl => {
			if (!imgUrl) {
				return;
			}
			isLoaded.value = false;
			await ImgHelper.loaded(imgUrl);
			isLoaded.value = true;
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
				<div
					class="-stretch"
					:style="{
						'background-image': background.cssBackgroundImage,
						'background-repeat': background.cssBackgroundRepeat,
						'background-size': background.cssBackgroundSize,
						'background-position': background.cssBackgroundPosition,
					}"
				/>
				<div v-if="darken" class="-stretch -fade" />
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

.-fade
	background-image: linear-gradient(to bottom, rgba(0,0,0,0.025), rgba(0,0,0,0.15))
	background-repeat: no-repeat
	background-size: cover
	background-position: top

.-inner
	z-index: 1
	position: relative
	width: 100%
	height: 100%
</style>
