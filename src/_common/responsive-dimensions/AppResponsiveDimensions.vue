<script lang="ts">
import { onMounted, ref, useTemplateRef, watch } from 'vue';

import { getElementWidth } from '~common/ruler/ruler-service';
import { onScreenResize } from '~common/screen/screen-service';
import { useEventSubscription } from '~common/system/event/event-topic';
import { useResizeObserver } from '~utils/resize-observer';
import { debounce } from '~utils/utils';

export class AppResponsiveDimensionsChangeEvent {
	constructor(
		public containerWidth: number,
		public height: number,
		public isFilled: boolean
	) {}
}
</script>

<script lang="ts" setup>
type Props = {
	ratio: number;
	maxWidth?: number;
	maxHeight?: number;
	parentWidth?: number;
};
const { ratio, maxWidth = 0, maxHeight = 0, parentWidth } = defineProps<Props>();

const emit = defineEmits<{
	change: [event: AppResponsiveDimensionsChangeEvent];
}>();

const root = useTemplateRef('root');
const width = ref<string>();
const height = ref('auto');

watch([() => ratio, () => maxWidth, () => maxHeight], _updateDimensions);
watch(() => parentWidth, _updateDimensions);

useEventSubscription(onScreenResize, () => _updateDimensions());

onMounted(() => {
	if (root.value?.parentNode) {
		// If the parent's dimensions change, we want to recalculate, just in case
		// the page shifted around.
		useResizeObserver({
			target: root.value!.parentNode as HTMLElement,
			// This can trigger a lot when someone is resizing the window, so let's
			// debounce it to something reasonable.
			callback: debounce(_updateDimensions, 500),
		});
	}

	_updateDimensions();
});

function _updateDimensions() {
	if (!root.value) {
		return;
	}

	let isFilled = true;
	let newWidth = parentWidth ?? getElementWidth(root.value.parentNode as HTMLElement);

	if (maxWidth && newWidth > maxWidth) {
		newWidth = maxWidth;
		isFilled = false;
	}

	let newHeight = newWidth / ratio;

	if (maxHeight && newHeight > maxHeight) {
		newHeight = maxHeight;
		isFilled = false;
		newWidth = newHeight * ratio;
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
