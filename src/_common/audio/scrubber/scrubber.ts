import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';

import { Ruler } from '../../ruler/ruler-service';

if (!GJ_IS_SSR) {
	const VueTouch = require('vue-touch');
	Vue.use(VueTouch);
}

@Component({})
export default class AppAudioScrubber extends Vue {
	@Prop(Number) currentTime!: number;
	@Prop(Number) duration!: number;

	private isDragging = false;
	private startX = 0;
	private timebarLeft = 0;
	private timebarWidth = 0;
	private scrubPos = -1;

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

	tap(event: HammerInput) {
		this.panStart(event);
		this.panEnd();
	}

	panStart(event: HammerInput) {
		const timebar = this.$refs.timebar as HTMLElement;
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

	pan(event: HammerInput) {
		this.calcScrubPos(event);

		// Will tell the browser to not select text while dragging.
		event.preventDefault();
	}

	panEnd() {
		this.$emit('seek', this.scrubPos);
		this.isDragging = false;
	}

	private calcScrubPos(event: HammerInput) {
		const timebar = this.$refs.timebar as HTMLElement;
		if (!this.isDragging || !timebar) {
			return;
		}

		this.scrubPos = (this.startX - this.timebarLeft + event.deltaX) / this.timebarWidth;
		this.scrubPos = Math.max(Math.min(this.scrubPos, 1), 0);
	}
}
