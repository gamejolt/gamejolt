<script lang="ts">
import { computed, onMounted, onUnmounted, ref, toRefs } from 'vue';
import { getCurrentServerTime } from '../../../utils/server-time';
import { AppCountdown } from '../../../_common/countdown/countdown';
import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
</script>

<script lang="ts" setup>
const props = defineProps({
	date: {
		type: Number,
		required: true,
	},
	ended: {
		type: Boolean,
		default: undefined,
	},
});

const { date, ended } = toRefs(props);

const currentTime = ref(getCurrentServerTime());
let interval: NodeJS.Timer | null = null;

const remaining = computed(() => {
	return date.value - currentTime.value;
});

const hasEnded = computed(() => {
	if (ended?.value === undefined) {
		return remaining.value <= 0;
	}
	return ended.value;
});

onMounted(() => {
	interval = setInterval(() => updateTimer(), 1000);
	updateTimer();
});

onUnmounted(() => {
	if (interval) {
		clearInterval(interval);
		interval = null;
	}
});

function updateTimer() {
	if (hasEnded.value) {
		return;
	}
	currentTime.value = getCurrentServerTime();
}
</script>

<template>
	<span v-if="hasEnded">
		<slot name="ended">
			<AppTranslate class="text-muted"> This quest has ended </AppTranslate>
		</slot>
	</span>
	<span v-else-if="date">
		<AppJolticon class="small text-muted" icon="clock" />
		{{ ' ' }}
		<AppCountdown class="text-muted" :end="date" />
	</span>
</template>
