<script lang="ts" setup>
import { onMounted, ref, onUnmounted, toRefs } from 'vue';

const props = defineProps({
	expiresOn: {
		type: Number,
		required: true,
	},
});

const { expiresOn } = toRefs(props);
const updateTimer = ref<NodeJS.Timer>();
const displayText = ref('');

onMounted(() => {
	updateTimer.value = setInterval(() => {
		_updateDisplayText();
	}, 1000);
	_updateDisplayText();
});

onUnmounted(() => {
	if (updateTimer.value) {
		clearInterval(updateTimer.value);
		updateTimer.value = undefined;
	}
});

function _updateDisplayText() {
	const totalDiff = expiresOn.value - Date.now();
	let diff = totalDiff;

	/**
	 * Base display:
	 *
	 * days:hours:minutes:seconds
	 * each number is padded to two digits
	 *
	 * Once we hit less than 72 hours, don't display days anymore
	 *
	 * Once less than 1 minute is left, do not pad the second counter
	 * (counts down from 11 .. 10 .. 9 .. 0)
	 *
	 * In case of less than/no seconds left, display a "0".
	 */

	if (diff <= 0) {
		displayText.value = '0';
		return;
	}

	const secondsInMil = 1000;
	const minsInMil = secondsInMil * 60;
	const hoursInMil = minsInMil * 60;
	const daysInMil = hoursInMil * 24;

	const components = [] as string[];

	// Only include days if we have 72 or more hours left.
	let hours = Math.floor(diff / hoursInMil);
	if (hours >= 72) {
		const days = Math.floor(diff / daysInMil);
		const daysStr = days.toString(10).padStart(2, '0');
		components.push(daysStr);
		diff -= days * daysInMil;

		// Recount hours after days have been deducted.
		hours = Math.floor(diff / hoursInMil);
	}

	if (totalDiff >= hoursInMil) {
		const hoursStr = hours.toString(10).padStart(2, '0');
		components.push(hoursStr);
		diff -= hours * hoursInMil;
	}

	if (totalDiff >= minsInMil) {
		const mins = Math.floor(diff / minsInMil);
		const minsStr = mins.toString(10).padStart(2, '0');
		components.push(minsStr);
		diff -= mins * minsInMil;
	}

	const seconds = Math.floor(diff / secondsInMil);
	// Only pad the seconds display if we have at least the minute display as well.
	if (totalDiff >= minsInMil) {
		const secondsStr = seconds.toString(10).padStart(2, '0');
		components.push(secondsStr);
	} else {
		const secondsStr = seconds.toString(10);
		components.push(secondsStr);
	}

	displayText.value = components.join(':');
}
</script>

<template>
	<span
		:style="{
			'font-size': 15 + (11 - displayText.length) + 'px',
		}"
	>
		{{ displayText }}
	</span>
</template>
