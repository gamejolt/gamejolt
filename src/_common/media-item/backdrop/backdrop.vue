<script lang="ts" setup>
import { computed, PropType } from 'vue';
import { MediaItem } from '../media-item-model';

const props = defineProps({
	mediaItem: {
		type: MediaItem,
		default: undefined,
	},
	radius: {
		type: String as PropType<'sm' | 'md' | 'lg' | 'full'>,
		default: undefined,
	},
});

const radiusClass = computed(() => {
	if (!props.radius) {
		return;
	}

	return '-' + props.radius;
});

const wrapperStyling = computed(() => {
	if (!props.mediaItem?.avg_img_color || props.mediaItem.img_has_transparency) {
		return;
	}

	return { backgroundColor: '#' + props.mediaItem.avg_img_color };
});
</script>

<template>
	<div class="media-item-backdrop" :class="radiusClass">
		<div class="-color" :class="radiusClass" :style="wrapperStyling" />
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

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
