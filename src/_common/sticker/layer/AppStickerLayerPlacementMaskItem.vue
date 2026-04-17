<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { getStickerLayerTargetBoundingBox } from '~common/sticker/layer/AppStickerLayerPlacementMaskTarget.vue';
import {
	getRectForStickerTarget,
	StickerLayerController,
} from '~common/sticker/layer/layer-controller';
import { StickerLayerItem } from '~common/sticker/layer/layer-item';

type Props = {
	target: StickerLayerItem;
	layer: StickerLayerController;
};
const { target, layer } = defineProps<Props>();

const _x = ref(0);
const _y = ref(0);
const _width = ref(0);
const _height = ref(0);

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
	<rect :x="_x" :y="_y" :width="_width" :height="_height" rx="12" fill="black" />
</template>
