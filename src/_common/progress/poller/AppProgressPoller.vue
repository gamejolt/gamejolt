<script lang="ts" setup>
import { onMounted, onUnmounted } from 'vue';

import { Api } from '../../api/api.service';

type Props = {
	url: string;
	interval?: number;
};
const { url, interval = 5_000 } = defineProps<Props>();

const emit = defineEmits<{
	progress: [response: unknown, progress: number, indeterminate: boolean];
	complete: [response: unknown];
	error: [response: unknown];
}>();

let timeoutHandle: NodeJS.Timer | undefined;

onMounted(() => {
	check();
	setPollTimeout();
});

onUnmounted(() => {
	clearPollTimeout();
});

async function check() {
	if (!url) {
		return;
	}

	let response;
	let hasError = false;
	try {
		response = await Api.sendRequest(url, undefined, {
			detach: true,
		});
	} catch (e) {
		emit('error', e);
		hasError = true;
	}

	if (!hasError) {
		if (response.status === 'complete' || response.status === 'error') {
			if (response.status === 'complete') {
				emit('complete', response);
			} else if (response.status === 'error') {
				emit('error', response);
			}
			return;
		}

		if (response.status === 'progress') {
			const indeterminate = typeof response.progress !== 'number';
			const progress = indeterminate ? 100 : response.progress;
			emit('progress', response, progress, indeterminate);
		}
	}

	setPollTimeout();
}

function setPollTimeout() {
	clearPollTimeout();
	timeoutHandle = setTimeout(() => check(), interval);
}

function clearPollTimeout() {
	if (timeoutHandle) {
		clearTimeout(timeoutHandle);
		timeoutHandle = undefined;
	}
}
</script>

<template>
	<slot />
</template>
