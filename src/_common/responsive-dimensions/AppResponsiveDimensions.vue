<script lang="ts">
import { onMounted, ref, toRefs, watch } from 'vue';
import { Ruler } from '../ruler/ruler-service';
import { onScreenResize } from '../screen/screen-service';
import { useEventSubscription } from '../system/event/event-topic';

export class AppResponsiveDimensionsChangeEvent {
	constructor(public containerWidth: number, public height: number, public isFilled: boolean) {}
}
</script>

<script lang="ts" setup>
const props = defineProps({
	ratio: {
		type: Number,
		required: true,
	},
	maxWidth: {
		type: Number,
		default: 0,
	},
	maxHeight: {
		type: Number,
		default: 0,
	},
});

const emit = defineEmits({
	change: (_event: AppResponsiveDimensionsChangeEvent) => true,
});

const { ratio, maxWidth, maxHeight } = toRefs(props);

const root = ref<HTMLElement>();
const width = ref<string>();
const height = ref('auto');

watch([ratio, maxWidth, maxHeight], _updateDimensions);

useEventSubscription(onScreenResize, () => _updateDimensions());

onMounted(() => _updateDimensions());

function _updateDimensions() {
	if (!root.value) {
		return;
	}

	let isFilled = true;
	let newWidth = Ruler.width(root.value.parentNode as HTMLElement);

	if (maxWidth.value && newWidth > maxWidth.value) {
		newWidth = maxWidth.value;
		isFilled = false;
	}

	let newHeight = newWidth / ratio.value;

	if (maxHeight.value && newHeight > maxHeight.value) {
		newHeight = maxHeight.value;
		isFilled = false;
		newWidth = newHeight * ratio.value;
	}

	width.value = `${newWidth}px`;
	height.value = `${newHeight}px`;
	emit('change', new AppResponsiveDimensionsChangeEvent(newWidth, newHeight, isFilled));
}
</script>

<template>
	<div
		ref="root"
		:style="{
			width,
			height,
			'max-width': maxWidth ? maxWidth + 'px' : undefined,
			'max-height': maxHeight ? maxHeight + 'px' : undefined,
		}"
	>
		<slot />
	</div>
</template>
