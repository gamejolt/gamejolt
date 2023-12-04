<script lang="ts" setup>
import { computed, ref, toRefs, watch } from 'vue';
import { Ruler } from '../../ruler/ruler-service';
import AppTouch, { AppTouchInput } from '../../touch/AppTouch.vue';

const props = defineProps({
	currentTime: {
		type: Number,
		required: true,
	},
	duration: {
		type: Number,
		required: true,
	},
});

const emit = defineEmits({
	seek: (_pos: number) => true,
});

const { currentTime, duration } = toRefs(props);

const isDragging = ref(false);

const startX = ref(0);
const timebarLeft = ref(0);
const timebarWidth = ref(0);
const scrubPos = ref(-1);

const timebar = ref<HTMLElement>();

const unfilledRight = computed(() => {
	if (scrubPos.value !== -1) {
		return 100 - scrubPos.value * 100 + '%';
	}

	if (!duration.value) {
		return 'auto';
	}

	return 100 - (currentTime.value / duration.value) * 100 + '%';
});

/**
 * We do this so that there's no flicker when scrubbing to a new position.
 * We set scrubPos while scrubbing and then fire an event. We do this so
 * that the scrub pos override will go back to normal as soon as a new time
 * change comes in.
 */
watch(currentTime, () => {
	if (!isDragging.value) {
		scrubPos.value = -1;
	}
});

function tap(event: AppTouchInput) {
	panStart(event);
	panEnd();
}

function panStart(event: AppTouchInput) {
	if (!timebar.value) {
		return;
	}

	isDragging.value = true;

	let offset = Ruler.offset(event.target);
	startX.value = event.center.x;

	offset = Ruler.offset(timebar.value);
	timebarWidth.value = offset.width;
	timebarLeft.value = offset.left;

	calcScrubPos(event);
}

function pan(event: AppTouchInput) {
	calcScrubPos(event);

	// Will tell the browser to not select text while dragging.
	event.preventDefault();
}

function panEnd() {
	emit('seek', scrubPos.value);
	isDragging.value = false;
}

function calcScrubPos(event: AppTouchInput) {
	if (!isDragging.value || !timebar.value) {
		return;
	}

	scrubPos.value = (startX.value - timebarLeft.value + event.deltaX) / timebarWidth.value;
	scrubPos.value = Math.max(Math.min(scrubPos.value, 1), 0);
}
</script>

<template>
	<AppTouch
		class="audio-scrubber"
		:class="{ dragging: isDragging }"
		:pan-options="{ direction: 'horizontal', threshold: 0 }"
		@panstart="panStart"
		@panmove="pan"
		@panend="panEnd"
		@tap="tap"
	>
		<div ref="timebar" class="audio-scrubber-timebar">
			<div class="audio-scrubber-timebar-handle" :style="{ right: unfilledRight }" />

			<div class="audio-scrubber-timebar-unfilled">
				<div class="audio-scrubber-timebar-filled" :style="{ right: unfilledRight }" />
			</div>
		</div>
	</AppTouch>
</template>

<style lang="stylus" src="./scrubber.styl" scoped></style>
