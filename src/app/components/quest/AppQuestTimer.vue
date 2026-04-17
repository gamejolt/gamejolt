<script lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

import { shorthandReadableTime } from '~common/filters/duration';
import AppJolticon from '~common/jolticon/AppJolticon.vue';
import { vAppTooltip } from '~common/tooltip/tooltip-directive';
import { getCurrentServerTime } from '~utils/server-time';
</script>

<script lang="ts" setup>
type Props = {
	endsOn: number;
	nowText?: string;
	tag?: 'span' | 'div';
};
const { endsOn, nowText = 'now', tag = 'span' } = defineProps<Props>();

let interval: NodeJS.Timeout | null = null;

const currentTime = ref(getCurrentServerTime());
const readableTimeRough = ref(getReadableTime('rough'));
const readableTimeExact = ref(getReadableTime('exact'));

const hasEnded = computed(() => endsOn - currentTime.value <= 0);

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

function getReadableTime(precision: 'rough' | 'exact') {
	return shorthandReadableTime(endsOn, {
		allowFuture: true,
		precision,
		joiner: ', ',
		nowText,
	});
}

function updateTimer() {
	currentTime.value = getCurrentServerTime();
	readableTimeRough.value = getReadableTime('rough');
	readableTimeExact.value = getReadableTime('exact');
}
</script>

<template>
	<component
		:is="tag"
		v-app-tooltip.touchable="hasEnded ? undefined : readableTimeExact"
		:style="{
			whiteSpace: `nowrap`,
		}"
	>
		<template v-if="hasEnded">
			<slot name="ended">
				<span class="text-muted">
					{{ $gettext(`This quest has ended`) }}
				</span>
			</slot>
		</template>
		<template v-else>
			<AppJolticon class="small text-muted" icon="clock" />
			<span class="text-muted">
				{{ ' ' + readableTimeRough }}
			</span>
		</template>
	</component>
</template>
