<script lang="ts" setup>
import { onMounted, PropType, ref, toRefs } from 'vue';
import { getStickerLayerTargetBoundingBox } from './AppStickerLayerPlacementMaskTarget.vue';
import { getRectForStickerTarget, StickerLayerController } from './layer-controller';
import { StickerLayerItem } from './layer-item';

const props = defineProps({
	target: {
		type: Object as PropType<StickerLayerItem>,
		required: true,
	},
	layer: {
		type: Object as PropType<StickerLayerController>,
		required: true,
	},
});

const { target, layer } = toRefs(props);

const _x = ref(0);
const _y = ref(0);
const _width = ref(0);
const _height = ref(0);

onMounted(() => {
	const rect = getRectForStickerTarget(layer.value, target.value);
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
