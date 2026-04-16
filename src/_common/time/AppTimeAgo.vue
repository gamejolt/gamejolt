<script lang="ts" setup>
import { formatDistanceStrict, formatDistanceToNow } from 'date-fns';
import { onUnmounted, ref, watch } from 'vue';

import { formatDate } from '~common/filters/date';
import { $gettext } from '~common/translate/translate.service';

type Props = {
	date: number | Date;
	withoutSuffix?: boolean;
	strict?: boolean;
	isFuture?: boolean;
};
const { date, withoutSuffix = false, strict = false, isFuture = false } = defineProps<Props>();

let timeout: number | undefined;
const timeAgo = ref('');
const fixedTime = ref('');

_refresh();

onUnmounted(() => {
	_clearTimeout();
});

watch(() => date, () => {
	_clearTimeout();
	_refresh();
});

function _refresh() {
	const time = strict
		? formatDistanceStrict(new Date(), date)
		: formatDistanceToNow(date);

	if (withoutSuffix) {
		timeAgo.value = time;
	} else if (isFuture) {
		timeAgo.value = $gettext('%{ time } left', { time });
	} else {
		timeAgo.value = $gettext('%{ time } ago', { time });
	}

	// In minutes.
	const input = date instanceof Date ? date.getTime() : date;
	const diff = (Date.now() - input) / 1000 / 60;

	let secondsUntilUpdate = 3600;
	if (diff < 1) {
		secondsUntilUpdate = 1;
	} else if (diff < 60) {
		secondsUntilUpdate = 30;
	} else if (diff < 180) {
		secondsUntilUpdate = 300;
	}

	fixedTime.value = formatDate(date, 'medium');

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
