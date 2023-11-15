<script lang="ts" setup>
import { onMounted, onUnmounted, toRefs } from 'vue';
import { Api } from '../../api/api.service';

const props = defineProps({
	url: {
		type: String,
		required: true,
	},
	interval: {
		type: Number,
		default: 5_000,
	},
});

const emit = defineEmits({
	progress: (_response: unknown, _progress: number, _indeterminate: boolean) => true,
	complete: (_response: unknown) => true,
	error: (_response: unknown) => true,
});

const { url, interval } = toRefs(props);

let timeoutHandle: NodeJS.Timer | undefined;

onMounted(() => {
	check();
	setPollTimeout();
});

onUnmounted(() => {
	clearPollTimeout();
});

async function check() {
	if (!url.value) {
		return;
	}

	let response;
	let hasError = false;
	try {
		response = await Api.sendRequest(url.value, undefined, {
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
	timeoutHandle = setTimeout(() => check(), interval.value);
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
