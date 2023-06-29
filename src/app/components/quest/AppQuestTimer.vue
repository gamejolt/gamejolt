<script lang="ts">
import { computed, onMounted, onUnmounted, ref, toRefs } from 'vue';
import { shorthandReadableTime } from '../../../_common/filters/duration';
import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import { getCurrentServerTime } from '../../../utils/server-time';
</script>

<script lang="ts" setup>
const props = defineProps({
	endsOn: {
		type: Number,
		required: true,
	},
});

const { endsOn } = toRefs(props);

const currentTime = ref(getCurrentServerTime());
const readableTime = ref(getReadableTime());
let interval: NodeJS.Timer | null = null;

const hasEnded = computed(() => endsOn.value - currentTime.value <= 0);

onMounted(() => {
	if (!interval) {
		interval = setInterval(updateTimer, 1_000);
	}
	updateTimer();
});

onUnmounted(() => {
	if (interval) {
		clearInterval(interval);
		interval = null;
	}
});

function getReadableTime() {
	return shorthandReadableTime(endsOn.value, {
		allowFuture: true,
		precision: 'rough',
		joiner: ', ',
		nowText: 'now',
	});
}

function updateTimer() {
	currentTime.value = getCurrentServerTime();
	readableTime.value = getReadableTime();
}
</script>

<template>
	<span v-if="hasEnded">
		<slot name="ended">
			<AppTranslate class="text-muted"> This quest has ended </AppTranslate>
		</slot>
	</span>
	<span v-else-if="endsOn">
		<AppJolticon class="small text-muted" icon="clock" />
		<span class="text-muted">
			{{ ' ' + readableTime }}
		</span>
	</span>
</template>
