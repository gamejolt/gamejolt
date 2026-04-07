<script lang="ts" setup>
import { onMounted, onUnmounted, useTemplateRef, watch } from 'vue';
import { GameSongModel } from '../../game/song/song.model';

type Props = {
	song: GameSongModel;
};
const { song } = defineProps<Props>();

const emit = defineEmits<{
	end: [];
	duration: [payload: { currentTime: number; duration: number }];
}>();

const audioEl = useTemplateRef<HTMLAudioElement>('audio');
let timer: ReturnType<typeof setInterval> | undefined;

watch(
	() => song.url,
	() => setup()
);

onMounted(() => setup());
onUnmounted(() => clearWatcher());

async function setup() {
	clearWatcher();
	await Promise.resolve(); // nextTick equivalent
	audioEl.value?.play();
	setWatcher();
}

function setWatcher() {
	timer = setInterval(() => {
		const el = audioEl.value;
		if (!el) return;
		if (el.ended) {
			clearWatcher();
			emit('end');
		} else {
			emit('duration', {
				currentTime: el.currentTime,
				duration: el.duration,
			});
		}
	}, 250);
}

function clearWatcher() {
	if (timer) {
		clearInterval(timer);
		timer = undefined;
	}
}

function seek(time: number) {
	if (audioEl.value) {
		audioEl.value.currentTime = time;
	}
}

defineExpose({ seek });
</script>

<template>
	<audio ref="audio" :src="song.url" preload="auto" />
</template>
