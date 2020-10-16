import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { Ruler } from '../../../ruler/ruler-service';
import { AppTooltip } from '../../../tooltip/tooltip-directive';
import { scrubVideo, VideoPlayerController } from '../controller';

if (!GJ_IS_SSR) {
	const VueTouch = require('vue-touch');
	Vue.use(VueTouch);
}

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppVideoPlayerScrubber extends Vue {
	@Prop(propRequired(VideoPlayerController)) player!: VideoPlayerController;

	private timebarLeft = 0;
	private timebarWidth = 0;

	$refs!: {
		timebar: HTMLDivElement;
	};

	get readableScrubberTime() {
		return this._createReadableTimestamp(this.player.currentTime);
	}

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

	private _createReadableTimestamp(time: number) {
		time /= 1000;
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60)
			.toString()
			.padStart(2, '0');

		return `${minutes}:${seconds}`;
	}

	tap(event: HammerInput) {
		this.initTimebarData();
		this.panEnd(event);
	}

	panStart(event: HammerInput) {
		this.initTimebarData();

		// Forward off to the normal pan event handler.
		this.pan(event);
	}

	pan(event: HammerInput) {
		scrubVideo(this.player, this.calcScrubPos(event), false);

		// Will tell the browser to not select text while dragging.
		event.preventDefault();
	}

	panEnd(event: HammerInput) {
		scrubVideo(this.player, this.calcScrubPos(event), true);
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
