<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, useTemplateRef, watch } from 'vue';
import { GameSongModel } from '../../game/song/song.model';

type Props = {
	song: GameSongModel;
};

type DurationPayload = {
	currentTime: number;
	duration: number;
};

const { song } = defineProps<Props>();

const emit = defineEmits<{
	end: [];
	duration: [payload: DurationPayload];
}>();

const audioRef = useTemplateRef('audio');
let timer: NodeJS.Timer | undefined;

async function setup() {
	clearWatcher();

	await nextTick();

	if (audioRef.value) {
		audioRef.value.play();
		setWatcher();
	}
}

function onSongEnded(sendEvent: boolean) {
	clearWatcher();

	if (sendEvent) {
		emit('end');
	}
}

function setWatcher() {
	timer = setInterval(() => {
		if (audioRef.value) {
			if (audioRef.value.ended) {
				onSongEnded(true);
			} else {
				emit('duration', {
					currentTime: audioRef.value.currentTime,
					duration: audioRef.value.duration,
				});
			}
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
	if (audioRef.value) {
		audioRef.value.currentTime = time;
	}
}

watch(
	() => song.url,
	() => {
		setup();
	}
);

onMounted(() => {
	setup();
});

onUnmounted(() => {
	clearWatcher();
});

// Expose the seek method so parent components can call it
defineExpose({
	seek,
});
</script>

<template>
	<audio ref="audio" :src="song.url" preload="auto" />
</template>
