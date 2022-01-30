<script lang="ts">
import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { Ruler } from '../../ruler/ruler-service';
import AppTouch, { AppTouchInput } from '../../touch/AppTouch.vue';

@Options({
	components: {
		AppTouch,
	},
})
export default class AppAudioScrubber extends Vue {
	@Prop(Number) currentTime!: number;
	@Prop(Number) duration!: number;

	isDragging = false;

	private startX = 0;
	private timebarLeft = 0;
	private timebarWidth = 0;
	private scrubPos = -1;

	@Emit('seek')
	emitSeek(_pos: number) {}

	declare $refs: {
		timebar?: HTMLElement;
	};

	get unfilledRight() {
		if (this.scrubPos !== -1) {
			return 100 - this.scrubPos * 100 + '%';
		}

		if (!this.duration) {
			return 'auto';
		}

		return 100 - (this.currentTime / this.duration) * 100 + '%';
	}

	/**
	 * We do this so that there's no flicker when scrubbing to a new position.
	 * We set scrubPos while scrubbing and then fire an event. We do this so
	 * that the scrub pos override will go back to normal as soon as a new time
	 * change comes in.
	 */
	@Watch('currentTime')
	onTimeChange() {
		if (!this.isDragging) {
			this.scrubPos = -1;
		}
	}

	tap(event: AppTouchInput) {
		this.panStart(event);
		this.panEnd();
	}

	panStart(event: AppTouchInput) {
		const timebar = this.$refs.timebar;
		if (!timebar) {
			return;
		}

		this.isDragging = true;

		let offset = Ruler.offset(event.target);
		this.startX = event.center.x;

		offset = Ruler.offset(timebar);
		this.timebarWidth = offset.width;
		this.timebarLeft = offset.left;

		this.calcScrubPos(event);
	}

	pan(event: AppTouchInput) {
		this.calcScrubPos(event);

		// Will tell the browser to not select text while dragging.
		event.preventDefault();
	}

	panEnd() {
		this.emitSeek(this.scrubPos);
		this.isDragging = false;
	}

	private calcScrubPos(event: AppTouchInput) {
		const timebar = this.$refs.timebar;
		if (!this.isDragging || !timebar) {
			return;
		}

		this.scrubPos = (this.startX - this.timebarLeft + event.deltaX) / this.timebarWidth;
		this.scrubPos = Math.max(Math.min(this.scrubPos, 1), 0);
	}
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
