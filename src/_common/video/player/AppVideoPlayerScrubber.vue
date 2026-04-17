<script lang="ts" setup>
import { computed, Ref, ref } from 'vue';

import { Ruler } from '~common/ruler/ruler-service';
import { kThemeHighlight } from '~common/theme/variables';
import AppTouch, { AppTouchInput } from '~common/touch/AppTouch.vue';
import { scrubVideo, VideoPlayerController } from '~common/video/player/controller';
import { styleChangeBg, styleWhen } from '~styles/mixins';
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
		class="player-control"
		:style="{
			position: `relative`,
			padding: `8px 12px`,
		}"
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
		<div
			ref="timebar"
			:style="{
				position: `relative`,
			}"
		>
			<div
				:style="{
					position: `absolute`,
					width: thumbSize.px,
					height: thumbSize.px,
					top: `50%`,
					marginTop: `-${thumbSize.value / 2}px`,
					marginRight: `-${thumbSize.value / 2}px`,
					backgroundColor: `white`,
					borderRadius: `50%`,
					cursor: `pointer`,
					transition: `${baseTransitions}, ${rightTransition}`,
					zIndex: 11,
					display: `flex`,
					justifyContent: `center`,
					right: filledRight,
					...styleWhen(player.isScrubbing, {
						...styleChangeBg('highlight'),
						width: thumbScrubbingSize.px,
						height: thumbScrubbingSize.px,
						marginTop: `-${thumbScrubbingSize.value / 2}px`,
						marginRight: `-${thumbScrubbingSize.value / 2}px`,
						transition: baseTransitions,
					}),
				}"
			/>

			<div
				:style="{
					backgroundColor: `rgba(255,255,255, 0.4)`,
					position: `absolute`,
					width: `100%`,
					top: `50%`,
					marginTop: `-2px`,
					height: `5px`,
					borderRadius: `5px`,
					overflow: `hidden`,
				}"
			>
				<div
					:style="{
						backgroundColor: `rgba(255,255,255, 0.2)`,
						position: `absolute`,
						top: 0,
						left: 0,
						bottom: 0,
						right: bufferedRight,
					}"
				/>
				<div
					:style="{
						backgroundColor: kThemeHighlight,
						position: `absolute`,
						top: 0,
						left: 0,
						bottom: 0,
						right: filledRight,
						transition: rightTransition,
						...styleWhen(player.isScrubbing, {
							transition: `none`,
						}),
					}"
				/>
			</div>
		</div>
	</AppTouch>
</template>

<style lang="stylus" scoped>
@import './common'
</style>
