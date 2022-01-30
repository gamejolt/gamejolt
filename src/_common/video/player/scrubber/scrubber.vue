<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { Ruler } from '../../../ruler/ruler-service';
import AppTouch, { AppTouchInput } from '../../../touch/AppTouch.vue';
import { scrubVideo, VideoPlayerController } from '../controller';

@Options({
	components: {
		AppTouch,
	},
})
export default class AppVideoPlayerScrubber extends Vue {
	@Prop({ type: Object, required: true }) player!: VideoPlayerController;

	private timebarLeft = 0;
	private timebarWidth = 0;
	timestampOffset = 0;

	declare $refs: {
		timebar: HTMLDivElement;
	};

	get currentPos() {
		return (this.player.queuedTimeChange ?? this.player.currentTime) / this.player.duration;
	}

	get filledRight() {
		if (!this.player.duration) {
			return 'auto';
		}

		return 100 - this.currentPos * 100 + '%';
	}

	get bufferedRight() {
		if (!this.player.bufferedTo) {
			return 'auto';
		}

		const bufferedPos = this.player.bufferedTo / this.player.duration;
		return 100 - bufferedPos * 100 + '%';
	}

	tap(event: AppTouchInput) {
		this.initTimebarData();
		this.panEnd(event);
	}

	panStart(event: AppTouchInput) {
		this.initTimebarData();
		scrubVideo(this.player, this.calcScrubPos(event), 'start');

		// Will tell the browser to not select text while dragging.
		event.preventDefault();
	}

	pan(event: AppTouchInput) {
		scrubVideo(this.player, this.calcScrubPos(event), 'scrub');
	}

	panEnd(event: AppTouchInput) {
		scrubVideo(this.player, this.calcScrubPos(event), 'end');
	}

	private initTimebarData() {
		const timebar = this.$refs.timebar;
		const { width, left } = Ruler.offset(timebar);
		this.timebarWidth = width;
		this.timebarLeft = left;
	}

	private calcScrubPos(event: AppTouchInput) {
		const pos = (event.center.x - this.timebarLeft) / this.timebarWidth;
		return Math.max(Math.min(pos, 1), 0);
	}
}
</script>

<template>
	<AppTouch
		class="player-control"
		:pan-options="{ direction: 'horizontal', threshold: 0 }"
		@panstart="panStart"
		@panmove="pan"
		@panend="panEnd"
		@tap="tap"
		@click.capture.prevent
	>
		<div ref="timebar" class="-timebar" :class="{ '-dragging': player.isScrubbing }">
			<div class="-timebar-handle" :style="{ right: filledRight }" />

			<div class="-timebar-unfilled">
				<div class="-timebar-buffered" :style="{ right: bufferedRight }" />
				<div class="-timebar-filled" :style="{ right: filledRight }" />
			</div>
		</div>
	</AppTouch>
</template>

<style lang="stylus" scoped>
@import '../common'

// sync with the refresh rate for the time poller
$-right-timing = 250ms
$-transition-right = right $-right-timing linear
$-handle-transition-base = width 200ms, height 200ms, margin-top 200ms, margin-right 200ms

.player-control
	position: relative
	padding: 8px 12px

.-timebar
	position: relative

	&-unfilled
		background-color: rgba($white, 0.4)
		position: absolute
		width: 100%
		top: 50%
		margin-top: -2px
		height: 5px
		border-radius: @height
		overflow: hidden

	&-filled
		background-color: var(--theme-highlight)
		position: absolute
		top: 0
		left: 0
		bottom: 0
		right: 0
		transition: $-transition-right

	&-buffered
		background-color: rgba($white, 0.2)
		position: absolute
		top: 0
		left: 0
		bottom: 0
		right: 0

	&-handle
		position: absolute
		width: 13px
		height: @width
		top: 50%
		margin-top: -(@width / 2)
		margin-right: -(@width / 2)
		background-color: $white
		border-radius: 50%
		cursor: pointer
		transition: $-handle-transition-base, $-transition-right
		z-index: 11
		display: flex
		justify-content: center

.-dragging
	.-timebar
		&-handle
			change-bg('highlight')
			width: 17px
			height: @width
			margin-top: -(@width / 2)
			margin-right: -(@width / 2)
			transition: $-handle-transition-base

		&-filled
			transition: none
</style>
