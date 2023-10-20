<script lang="ts" setup>
import { onMounted, onUnmounted, ref, toRefs } from 'vue';

const props = defineProps({
	end: {
		type: Number,
		required: true,
	},
});

const { end } = toRefs(props);

const time = ref('');
let interval: number | undefined;

updateTimer();

function updateTimer() {
	let timeLeft = (end.value - Date.now()) / 1000;
	if (timeLeft < 0) {
		time.value = '0:0:0';
		return;
	}

	// Only show days left if there's more than 3 days.
	let daysLeft = 0;
	if (Math.floor(timeLeft / 86400) > 3) {
		daysLeft = Math.floor(timeLeft / 86400);
		if (daysLeft) {
			timeLeft -= daysLeft * 86400;
		}
	}

	const hoursLeft = Math.floor(timeLeft / 3600);
	if (hoursLeft) {
		timeLeft -= hoursLeft * 3600;
	}

	const minutesLeft = Math.floor(timeLeft / 60);
	if (minutesLeft) {
		timeLeft -= minutesLeft * 60;
	}

	const secondsLeft = Math.floor(timeLeft);

	let text = `${pad(hoursLeft)}:${pad(minutesLeft)}:${pad(secondsLeft)}`;
	if (daysLeft) {
		text = `${daysLeft}:${text}`;
	}

	time.value = text;
}

function pad(num: number): string {
	if (num < 10) {
		return '0' + num;
	}
	return '' + num;
}

onMounted(() => {
	interval = window.setInterval(() => updateTimer(), 1000);
});

onUnmounted(() => {
	if (interval) {
		window.clearInterval(interval);
	}
});
</script>

<template>
	<span>{{ time }}</span>
</template>
