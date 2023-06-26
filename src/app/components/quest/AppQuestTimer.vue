<script lang="ts">
import { PropType, computed, onMounted, onUnmounted, ref, toRefs } from 'vue';
import { shorthandReadableTime } from '../../../_common/filters/duration';
import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import { vAppTooltip } from '../../../_common/tooltip/tooltip-directive';
import { getCurrentServerTime } from '../../../utils/server-time';
</script>

<script lang="ts" setup>
const props = defineProps({
	endsOn: {
		type: Number,
		required: true,
	},
	nowText: {
		type: String,
		default: 'now',
		validator: val => typeof val === 'string' && val.length > 0,
	},
	tag: {
		type: String as PropType<'span' | 'div'>,
		default: 'span',
		validator: val => val === 'span' || val === 'div',
	},
});

const { endsOn } = toRefs(props);

let interval: NodeJS.Timer | null = null;

const currentTime = ref(getCurrentServerTime());
const readableTimeRough = ref(getReadableTime('rough'));
const readableTimeExact = ref(getReadableTime('exact'));

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

function getReadableTime(precision: 'rough' | 'exact') {
	return shorthandReadableTime(endsOn.value, {
		allowFuture: true,
		precision,
		joiner: ', ',
		nowText: 'now',
	});
}

function updateTimer() {
	currentTime.value = getCurrentServerTime();
	readableTimeRough.value = getReadableTime('rough');
	readableTimeExact.value = getReadableTime('exact');
}
</script>

<template>
	<span v-if="hasEnded">
		<slot name="ended">
			<span class="text-muted">
				{{ $gettext(`This quest has ended`) }}
			</span>
		</slot>
	</span>
	<span v-else-if="endsOn" v-app-tooltip.touchable="readableTimeExact">
		<AppJolticon class="small text-muted" icon="clock" />
		<span class="text-muted">
			{{ ' ' + readableTimeRough }}
		</span>
	</span>
</template>
