<script lang="ts">
import { computed, onMounted, ref, toRaw } from 'vue';

import {
	getRectForStickerTarget,
	StickerLayerController,
	StickerLayerTargetRect,
} from '~common/sticker/layer/layer-controller';
import { StickerLayerItem } from '~common/sticker/layer/layer-item';

// How much extra padding (in px) should we put around each target for the
// cutout that we make?
const TargetVPadding = 4;
const TargetHPadding = 8;

export function getStickerLayerTargetBoundingBox(rect: StickerLayerTargetRect) {
	const { x, y, width, height } = rect;
	return {
		x: x - TargetHPadding,
		y: y - TargetVPadding,
		width: width + TargetHPadding * 2,
		height: height + TargetVPadding * 2,
	};
}
</script>

<script lang="ts" setup>
type Props = {
	target: StickerLayerItem;
	layer: StickerLayerController;
};
const { target, layer } = defineProps<Props>();

const _x = ref(0);
const _y = ref(0);
const _width = ref(0);
const _height = ref(0);

const styles = computed(() => {
	return {
		transform: `translate(${_x.value}px, ${_y.value}px)`,
		width: _width.value + 'px',
		height: _height.value + 'px',
	};
});

const isHovered = computed(() => toRaw(layer.hoveredTarget.value) === toRaw(target));

onMounted(() => {
	const rect = getRectForStickerTarget(layer, target);
	if (!rect) {
		return;
	}

	const { x, y, width, height } = getStickerLayerTargetBoundingBox(rect);
	_x.value = x;
	_y.value = y;
	_width.value = width;
	_height.value = height;
});
</script>

<template>
	<div class="-target" :class="{ '-hovered': isHovered }" :style="styles" />
</template>

<style lang="stylus" scoped>
.-target
	rounded-corners-lg()
	position: absolute
	top: 0
	left: 0
	border-width: $border-width-large
	border-color: var(--theme-link-hover)
	border-style: dashed
	background-color: transparent

.-hovered
	border-color: var(--theme-link)
	border-style: solid
</style>
