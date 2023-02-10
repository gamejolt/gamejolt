<script lang="ts" setup>
import { formatDistanceStrict, formatDistanceToNow } from 'date-fns';
import { onUnmounted, ref, toRefs, watch } from 'vue';
import { formatDate } from '../filters/date';
import { $gettextInterpolate } from '../translate/translate.service';

const props = defineProps({
	date: {
		type: [Number, Date],
		required: true,
	},
	withoutSuffix: {
		type: Boolean,
		required: false,
	},
	strict: {
		type: Boolean,
		required: false,
	},
	isFuture: {
		type: Boolean,
		required: false,
	},
});

const { date, withoutSuffix, strict, isFuture } = toRefs(props);

let timeout: number | undefined;
const timeAgo = ref('');
const fixedTime = ref('');

_refresh();

onUnmounted(() => {
	_clearTimeout();
});

watch(date, () => {
	_clearTimeout();
	_refresh();
});

function _refresh() {
	const time = strict.value
		? formatDistanceStrict(new Date(), date.value)
		: formatDistanceToNow(date.value);

	if (withoutSuffix.value) {
		timeAgo.value = time;
	} else if (isFuture.value) {
		timeAgo.value = $gettextInterpolate('%{ time } left', { time });
	} else {
		timeAgo.value = $gettextInterpolate('%{ time } ago', { time });
	}

	// In minutes.
	const input = date.value instanceof Date ? date.value.getTime() : date.value;
	const diff = (Date.now() - input) / 1000 / 60;

	let secondsUntilUpdate = 3600;
	if (diff < 1) {
		secondsUntilUpdate = 1;
	} else if (diff < 60) {
		secondsUntilUpdate = 30;
	} else if (diff < 180) {
		secondsUntilUpdate = 300;
	}

	fixedTime.value = formatDate(date.value, 'medium');

	if (!import.meta.env.SSR) {
		timeout = window.setTimeout(() => _refresh(), secondsUntilUpdate * 1000);
	}
}

function _clearTimeout() {
	if (timeout) {
		clearTimeout(timeout);
		timeout = undefined;
	}
}
</script>

<template>
	<span :title="fixedTime">{{ timeAgo }}</span>
</template>
