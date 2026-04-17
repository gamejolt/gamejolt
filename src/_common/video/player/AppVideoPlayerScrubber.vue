<script lang="ts" setup>
import { computed, Ref, ref } from 'vue';

import { Ruler } from '~common/ruler/ruler-service';
import AppTouch, { AppTouchInput } from '~common/touch/AppTouch.vue';
import { scrubVideo, VideoPlayerController } from '~common/video/player/controller';
import { buildCSSPixelValue } from '~styles/variables';

type Props = {
	player: VideoPlayerController;
};
const { player } = defineProps<Props>();

const timebar = ref() as Ref<HTMLDivElement>;

const timebarLeft = ref(0);
const timebarWidth = ref(0);

const currentPos = computed(() => {
	return (player.queuedTimeChange ?? player.currentTime) / player.duration;
});

const filledRight = computed(() => {
	if (!player.duration) {
		return 'auto';
	}

	return 100 - currentPos.value * 100 + '%';
});

const bufferedRight = computed(() => {
	if (!player.bufferedTo) {
		return 'auto';
	}

	const bufferedPos = player.bufferedTo / player.duration;
	return 100 - bufferedPos * 100 + '%';
});

function tap(event: AppTouchInput) {
	initTimebarData();
	panEnd(event);
}

function panStart(event: AppTouchInput) {
	initTimebarData();
	scrubVideo(player, calcScrubPos(event), 'start');

	// Will tell the browser to not select text while dragging.
	event.preventDefault();
}

function pan(event: AppTouchInput) {
	scrubVideo(player, calcScrubPos(event), 'scrub');
}

function panEnd(event: AppTouchInput) {
	scrubVideo(player, calcScrubPos(event), 'end');
}

function initTimebarData() {
	const { width, left } = Ruler.offset(timebar.value);
	timebarWidth.value = width;
	timebarLeft.value = left;
}

function calcScrubPos(event: AppTouchInput) {
	const pos = (event.center.x - timebarLeft.value) / timebarWidth.value;
	return Math.max(Math.min(pos, 1), 0);
}

const baseTransitions = `width 200ms, height 200ms, margin-top 200ms, margin-right 200ms`;
const rightTransition = `right 250ms linear`;

const thumbSize = buildCSSPixelValue(13);
const thumbScrubbingSize = buildCSSPixelValue(17);
</script>

<template>
	<AppTouch
		class="player-control relative py-[8px] px-[12px]"
		:pan-options="{
			direction: 'horizontal',
			threshold: 0,
		}"
		@panstart="panStart"
		@panmove="pan"
		@panend="panEnd"
		@tap="tap"
		@click.capture.prevent
	>
		<div ref="timebar" class="relative">
			<div
				class="absolute top-1/2 z-[11] flex cursor-pointer justify-center rounded-full bg-white"
				:class="{ 'change-bg-highlight': player.isScrubbing }"
				:style="{
					width: player.isScrubbing ? thumbScrubbingSize.px : thumbSize.px,
					height: player.isScrubbing ? thumbScrubbingSize.px : thumbSize.px,
					marginTop: player.isScrubbing
						? `-${thumbScrubbingSize.value / 2}px`
						: `-${thumbSize.value / 2}px`,
					marginRight: player.isScrubbing
						? `-${thumbScrubbingSize.value / 2}px`
						: `-${thumbSize.value / 2}px`,
					transition: player.isScrubbing
						? baseTransitions
						: `${baseTransitions}, ${rightTransition}`,
					right: filledRight,
				}"
			/>

			<div
				class="absolute top-1/2 -mt-[2px] h-[5px] w-full overflow-hidden rounded-[5px] bg-[rgba(255,255,255,0.4)]"
			>
				<div
					class="absolute top-0 left-0 bottom-0 bg-[rgba(255,255,255,0.2)]"
					:style="{
						right: bufferedRight,
					}"
				/>
				<div
					class="absolute top-0 left-0 bottom-0 bg-highlight"
					:style="{
						right: filledRight,
						transition: player.isScrubbing ? `none` : rightTransition,
					}"
				/>
			</div>
		</div>
	</AppTouch>
</template>

<style lang="stylus" scoped>
@import './common'
</style>
