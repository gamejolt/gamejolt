<script lang="ts" setup>
import { computed, onMounted, ref, toRefs, watch } from 'vue';
import { formatFuzzynumber } from '../../filters/fuzzynumber';

const props = defineProps({
	count: {
		type: Number,
		required: true,
	},
	imgUrl: {
		type: String,
		required: true,
	},
	animate: {
		type: Boolean,
	},
});

const { count, imgUrl, animate } = toRefs(props);

let timer: NodeJS.Timer | null = null;

let hasQueuedTimer = false;
const shouldAnimate = ref(false);

const displayCount = computed(() => formatFuzzynumber(count.value));

watch(count, onCountChanged);

onMounted(() => {
	if (animate.value) {
		_animateItem();
	}
});

function _animateItem() {
	if (!animate.value) {
		_clearTimer();
		return;
	}

	if (timer != null) {
		hasQueuedTimer = true;
		return;
	}

	shouldAnimate.value = true;
	timer = setTimeout(() => {
		_clearTimer();
		if (hasQueuedTimer) {
			hasQueuedTimer = false;
			_animateItem();
			return;
		}

		shouldAnimate.value = false;
	}, 2_000);
}

function _clearTimer() {
	if (timer) {
		clearTimeout(timer);
	}
	timer = null;
}

function onCountChanged() {
	if (animate.value) {
		_animateItem();
	}
}
</script>

<template>
	<div class="-item">
		<span class="-sticker" :class="{ '-animated': animate, '-keep-animating': shouldAnimate }">
			<img :src="imgUrl" @dragstart.prevent />
		</span>
		<span class="-count">
			{{ displayCount }}
		</span>
	</div>
</template>

<style lang="stylus" scoped>
.-item
	rounded-corners()
	background-color: var(--theme-bg-offset)
	display: inline-flex
	align-items: center
	padding: 0px 4px
	margin: 2px 4px 2px 0
	user-select: none

	&:last-child
		margin-right: 0

.-sticker
	width: 20px
	height: 20px

	& > img
		display: block
		width: 100%
		height: 100%

.-count
	font-size: $font-size-tiny
	margin: 0 4px

.-animated
	animation-name: new-indicator
	// Make sure this is the same, or lower, than the TS file.
	animation-duration: 1s
	animation-timing-function: $ease-in-out-back
	animation-iteration-count: 1
	animation-play-state: paused
	transform: rotate(0), scale(1)

.-keep-animating
	animation-play-state: running
	animation-iteration-count: infinite

@keyframes new-indicator
	0%
		transform: rotate(0) scale(1)

	// Slide to the left
	30%
		transform: rotate(-30deg) scale(1.2)

	33%
		transform: rotate(-20deg) scale(1.2)

	36%
		transform: rotate(-25deg) scale(1.2)

	// Slide to the right
	63%
		transform: rotate(30deg) scale(1.2)

	66%
		transform: rotate(20deg) scale(1.2)

	69%
		transform: rotate(25deg) scale(1.2)

	// Criss cross
	100%
		transform: rotate(0deg) scale(1)
</style>
