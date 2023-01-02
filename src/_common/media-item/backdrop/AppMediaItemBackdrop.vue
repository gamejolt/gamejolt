<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { MediaItem } from '../media-item-model';

const props = defineProps({
	mediaItem: {
		type: Object as PropType<MediaItem>,
		default: undefined,
	},
	radius: {
		type: String as PropType<'sm' | 'md' | 'lg' | 'full'>,
		default: undefined,
	},
	/**
	 * If no color on the media item, will use this fallback color. You can use
	 * the theme variables in this prop like `var(--theme-bg-offset)`
	 */
	fallbackColor: {
		type: String,
		default: '',
	},
});

const { mediaItem, radius, fallbackColor } = toRefs(props);

const radiusClass = computed(() => {
	if (!radius?.value) {
		return;
	}

	return '-' + radius?.value;
});

const wrapperStyling = computed(() => {
	if (!mediaItem?.value?.avg_img_color || mediaItem?.value.img_has_transparency) {
		if (fallbackColor.value) {
			return { backgroundColor: fallbackColor.value };
		}

		return;
	}

	return { backgroundColor: '#' + mediaItem.value.avg_img_color };
});
</script>

<template>
	<div class="media-item-backdrop" :class="radiusClass">
		<div class="-color" :class="radiusClass" :style="wrapperStyling" />
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
.media-item-backdrop
	position: relative
	z-index: 0
	display: flex
	overflow: hidden
	width: 100%
	height: 100%

	.-color
		position: absolute
		z-index: -1
		top: 1px
		right: 1px
		bottom: 1px
		left: 1px
		width: auto

	&.-sm
	.-color.-sm
		rounded-corners-sm()

	&.-md
	.-color.-md
		rounded-corners()

	&.-lg
	.-color.-lg
		rounded-corners-lg()

	&.-full
	.-color.-full
		img-circle()
</style>
