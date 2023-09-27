<script lang="ts" setup>
import { PropType, computed, onMounted, onUnmounted, ref, toRefs, watch } from 'vue';
import { ImgSlideshow } from './slideshow/sheets';

const props = defineProps({
	sheet: {
		type: Object as PropType<ImgSlideshow>,
		required: true,
	},
	pause: {
		type: Boolean,
	},
	startOffset: {
		type: Number,
		default: 0,
		validator: val => typeof val === 'number' && 0 <= val && val <= 1,
	},
});

const { sheet, pause, startOffset } = toRefs(props);

let timer: NodeJS.Timer | null = null;

const frame = ref(0);

const offset = computed(() => {
	const { frames } = sheet.value;
	return (frame.value / frames) * 100;
});

function initAnimator(fromStart: boolean) {
	if (pause.value) {
		return;
	}

	if (timer) {
		clearInterval(timer);
	}
	if (fromStart) {
		const offset = Math.min(1, Math.max(0, startOffset.value));
		const chosenFrame = Math.round(sheet.value.frames * offset);
		frame.value = chosenFrame;
	}

	timer = setInterval(() => {
		const { frames, blankFrames } = sheet.value;

		if (frame.value + 1 >= frames + blankFrames) {
			frame.value = 0;
		} else {
			++frame.value;
		}
	}, 1_000 / sheet.value.fps);
}

watch(sheet, () => initAnimator(true));

watch(pause, shouldPause => {
	if (shouldPause) {
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
	} else if (!timer) {
		initAnimator(false);
	}
});

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
