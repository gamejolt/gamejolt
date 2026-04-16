<script lang="ts" setup>
import { computed } from 'vue';

import { styleAbsoluteFill } from '../../../_styles/mixins';
import { MediaItemModel } from '../media-item-model';

type Props = {
	mediaItem?: MediaItemModel;
	radius?: 'sm' | 'md' | 'lg' | 'full';
	/**
	 * If no color on the media item, will use this fallback color. You can use
	 * the theme variables in this prop like `var(--theme-bg-offset)`
	 */
	fallbackColor?: string;
	colorOpacity?: number;
};
const {
	mediaItem,
	radius,
	fallbackColor = '',
	colorOpacity = 1,
} = defineProps<Props>();

const radiusClass = computed(() => {
	if (!radius) {
		return;
	}

	return '-' + radius;
});

const colorStyles = computed(() => {
	if (!mediaItem?.avg_img_color || mediaItem?.img_has_transparency) {
		if (fallbackColor) {
			return { backgroundColor: fallbackColor };
		}

		return;
	}

	return { backgroundColor: '#' + mediaItem.avg_img_color };
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
