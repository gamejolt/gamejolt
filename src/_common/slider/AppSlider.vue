<script lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRefs, watch } from 'vue';
import { clampNumber } from '../../utils/number';
import { Ruler } from '../ruler/ruler-service';
import { vAppTooltip } from '../tooltip/tooltip-directive';

export type ScrubberStage = 'start' | 'scrub' | 'end';

/**
 * @param percent - scaled from 0 to 1
 * @param stage - the stage of the scrubber
 */
export type ScrubberCallback = {
	percent: number;
	stage: ScrubberStage;
};
</script>

<script lang="ts" setup>
const props = defineProps({
	/** Expects to be scaled from 0 to 1. */
	percent: {
		type: Number,
		required: true,
	},
	vertical: {
		type: Boolean,
	},
	overlay: {
		type: Boolean,
	},
	/** Provided value is 0 to 100. */
	sliderValueTooltip: {
		type: Function,
		default: (value: number) => `${value}%`,
	},
});

const emit = defineEmits({
	scrub: (_: ScrubberCallback) => true,
});

const { percent, vertical, sliderValueTooltip } = toRefs(props);

const isDragging = ref(false);

const thumbSize = ref(12);
const sliderSize = ref(128);
const thumbOffset = ref(0);
const _sliderOffset = ref(0);
const _percentFull = ref(0);

const slider = ref<HTMLElement>();
const thumb = ref<HTMLDivElement>();

const sliderFilledStyling = computed(() => {
	if (vertical.value) {
		return {
			top: sliderSize.value - thumbOffset.value + 'px',
			right: 0,
			bottom: 0,
			left: 0,
		};
	}

	return {
		top: 0,
		right: sliderSize.value - thumbOffset.value + 'px',
		bottom: 0,
		left: 0,
	};
});

const thumbStyling = computed(() => {
	return {
		top: vertical.value ? thumbOffset.value + 'px' : '',
		left: !vertical.value ? thumbOffset.value + 'px' : '',
		height: thumbSize.value + 'px',
		width: thumbSize.value + 'px',
	};
});

const sliderStyling = computed(() => {
	return {
		height: vertical.value ? sliderSize.value + 'px' : '4px',
		width: !vertical.value ? sliderSize.value + 'px' : '4px',
	};
});

const readableSliderPercentage = computed(() => {
	return sliderValueTooltip.value(_percentFull.value);
});

onMounted(() => {
	nextTick().finally(() => {
		initVariables();
		_setThumbOffset('end');
	});
});

function initVariables() {
	if (!slider.value) {
		return;
	}
	const offset = Ruler.offset(slider.value);
	_sliderOffset.value = vertical.value ? offset.top : offset.left;
	sliderSize.value = vertical.value ? offset.height : offset.width;
}

async function onMouseDown(event: MouseEvent | TouchEvent) {
	await nextTick();

	isDragging.value = true;
	initVariables();
	_setThumbOffset('start', event);

	window.addEventListener('mouseup', onWindowMouseUp);
	window.addEventListener('mousemove', onWindowMouseMove);
	window.addEventListener('touchend', onWindowMouseUp, {
		passive: false,
	});
	window.addEventListener('touchmove', onWindowMouseMove, {
		passive: false,
	});
}

function _onMouseMove(event: MouseEvent) {
	if (!isDragging.value) {
		return;
	}
	_setThumbOffset('scrub', event);
}

function _onMouseUp(event: MouseEvent) {
	if (!isDragging.value) {
		return;
	}
	_setThumbOffset('end', event);
	isDragging.value = false;
}

function onWindowMouseMove(event: MouseEvent) {
	_onMouseMove(event);
}

function onWindowMouseUp(event: MouseEvent) {
	_onMouseUp(event);
	cleanupWindowListeners();
}

function cleanupWindowListeners() {
	window.removeEventListener('mousemove', onWindowMouseMove);
	window.removeEventListener('mouseup', onWindowMouseUp);
	window.removeEventListener('touchend', onWindowMouseUp);
	window.removeEventListener('touchmove', onWindowMouseMove);
}

onBeforeUnmount(() => {
	cleanupWindowListeners();
});

function _setThumbOffset(stage: ScrubberStage, event?: Event) {
	let mouseOffset = 0;
	let pageX: number | null = null;
	let pageY: number | null = null;

	if (event instanceof MouseEvent) {
		pageX = event.pageX;
		pageY = event.pageY;
	} else if (typeof window.TouchEvent !== 'undefined' && event instanceof TouchEvent) {
		// Prevent page scrolling if we got a touch event.
		event.preventDefault();

		if (event.changedTouches.length > 0) {
			pageX = event.changedTouches[0].pageX;
			pageY = event.changedTouches[0].pageY;
		}
	}

	if (pageX && pageY) {
		mouseOffset = vertical.value ? pageY : pageX;
	} else {
		mouseOffset = percent.value * sliderSize.value + _sliderOffset.value;
	}

	const sliderOffsetStart = -(thumbSize.value / 2);
	const sliderOffsetEnd = sliderOffsetStart + sliderSize.value;

	thumbOffset.value = Math.max(
		sliderOffsetStart,
		Math.min(sliderOffsetEnd, mouseOffset - _sliderOffset.value + sliderOffsetStart)
	);

	const scale = 100;
	_percentFull.value = Math.round(
		((sliderSize.value - thumbOffset.value - thumbSize.value / 2) / sliderSize.value) * scale
	);

	// invert the value for horizontal sliders
	if (!vertical.value) {
		_percentFull.value = Math.abs(_percentFull.value - scale);
	}

	const scaledPercent = clampNumber(_percentFull.value / scale, 0, 1);
	emit('scrub', { percent: scaledPercent, stage: stage });
}

watch(percent, () => {
	if (isDragging.value) {
		return;
	}

	// If the slider percent.value changed by external means, set the thumb offset
	// to match the current slider level.
	_setThumbOffset('end');
});
</script>

<template>
	<div
		class="-slider"
		:class="{
			'-overlay': overlay,
		}"
	>
		<div class="-mask" @mousedown="onMouseDown" @touchstart="onMouseDown" />

		<div
			ref="slider"
			class="-inner"
			:class="{ '-dragging': isDragging }"
			:style="sliderStyling"
		>
			<div class="-inner-filled" :style="sliderFilledStyling" />

			<div
				ref="thumb"
				v-app-tooltip="readableSliderPercentage"
				class="-inner-thumb"
				:style="thumbStyling"
				@mousedown="onMouseDown"
				@touchstart="onMouseDown"
			/>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-slider
	--slider-color: var(--theme-fg-rgb)
	user-select: none
	position: relative
	padding: 8px
	display: flex

	&.-overlay
		 --slider-color: 255,255,255

// Stretch out an invisible div while we're dragging to hopefully capture events properly
.-mask
	position: absolute
	top: 0
	bottom: 0
	left: 0
	right: 0
	z-index: 1
	cursor: pointer

.-inner
	border-radius: $border-radius-small
	position: relative
	margin: auto
	background-color: 'rgba(%s, 0.5)' % var(--slider-color)
	display: flex
	justify-content: center
	align-items: center
	flex: auto

.-inner-filled
	position: absolute
	background-color: 'rgb(%s)' % var(--slider-color)
	border-radius: $border-radius-small

.-inner-thumb
	position: absolute
	border-radius: 50%
	background-color: 'rgb(%s)' % var(--slider-color)
	z-index: 2
	cursor: pointer

.-dragging
	.-inner-thumb
		pointer-events: none
</style>
