import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { Ruler } from '../../../ruler/ruler-service';
import { scrubVideo, VideoPlayerController } from '../controller';

if (!GJ_IS_SSR) {
	const VueTouch = require('vue-touch');
	Vue.use(VueTouch);
}

@Component({})
export default class AppVideoPlayerScrubber extends Vue {
	@Prop(propRequired(VideoPlayerController)) player!: VideoPlayerController;

	private timebarLeft = 0;
	private timebarWidth = 0;
	timestampOffset = 0;

	$refs!: {
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

	tap(event: HammerInput) {
		this.initTimebarData();
		this.panEnd(event);
	}

	panStart(event: HammerInput) {
		this.initTimebarData();
		scrubVideo(this.player, this.calcScrubPos(event), 'start');

		// Will tell the browser to not select text while dragging.
		event.preventDefault();
	}

	pan(event: HammerInput) {
		scrubVideo(this.player, this.calcScrubPos(event), 'scrub');
	}

	panEnd(event: HammerInput) {
		scrubVideo(this.player, this.calcScrubPos(event), 'end');
	}

	private initTimebarData() {
		const timebar = this.$refs.timebar;
		const { width, left } = Ruler.offset(timebar);
		this.timebarWidth = width;
		this.timebarLeft = left;
	}

	private calcScrubPos(event: HammerInput) {
		const pos = (event.center.x - this.timebarLeft) / this.timebarWidth;
		return Math.max(Math.min(pos, 1), 0);
	}
}
