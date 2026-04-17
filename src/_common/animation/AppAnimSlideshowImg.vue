<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

import { ImgSlideshow } from '~common/animation/slideshow/sheets';

type Props = {
	sheet: ImgSlideshow;
	pause?: boolean;
	startOffset?: number;
};
const { sheet, pause, startOffset = 0 } = defineProps<Props>();

let timer: NodeJS.Timer | null = null;

const frame = ref(0);

const offset = computed(() => {
	const { frames } = sheet;
	return (frame.value / frames) * 100;
});

function initAnimator(fromStart: boolean) {
	if (pause) {
		return;
	}

	if (timer) {
		clearInterval(timer);
	}
	if (fromStart) {
		const offset = Math.min(1, Math.max(0, startOffset));
		const chosenFrame = Math.round(sheet.frames * offset);
		frame.value = chosenFrame;
	}

	timer = setInterval(() => {
		const { frames, blankFrames = 0 } = sheet;

		if (frame.value + 1 >= frames + blankFrames) {
			frame.value = 0;
		} else {
			++frame.value;
		}
	}, 1_000 / sheet.fps);
}

watch(
	() => sheet,
	() => initAnimator(true)
);

watch(
	() => pause,
	shouldPause => {
		if (shouldPause) {
			if (timer) {
				clearInterval(timer);
				timer = null;
			}
		} else if (!timer) {
			initAnimator(false);
		}
	}
);

onMounted(() => {
	initAnimator(true);
});

onUnmounted(() => {
	if (timer) {
		clearInterval(timer);
	}
});
</script>

<template>
	<img
		:src="sheet.asset"
		:style="{
			transform: `translateX(-${offset}%)`,
		}"
		draggable="false"
		alt=""
	/>
</template>
