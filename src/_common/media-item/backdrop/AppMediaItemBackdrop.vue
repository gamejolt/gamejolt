<script lang="ts" setup>
import { computed, PropType, toRefs } from 'vue';
import { styleAbsoluteFill } from '../../../_styles/mixins';
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
	colorOpacity: {
		type: Number,
		default: 1,
	},
});

const { mediaItem, radius, fallbackColor } = toRefs(props);

const radiusClass = computed(() => {
	if (!radius?.value) {
		return;
	}

	return '-' + radius?.value;
});

const colorStyles = computed(() => {
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
		<div
			:style="{
				...colorStyles,
				...styleAbsoluteFill({
					inset: `1px`,
					zIndex: -1,
				}),
				width: `auto`,
				borderRadius: `inherit`,
				opacity: colorOpacity,
			}"
		/>
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
	border-radius: 0

	&.-sm
		rounded-corners-sm()

	&.-md
		rounded-corners()

	&.-lg
		rounded-corners-lg()

	&.-full
		img-circle()
</style>
