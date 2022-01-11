import { Options, Prop, Vue } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { Ruler } from '../../../ruler/ruler-service';
import AppTouch, { AppTouchInput } from '../../../touch/AppTouch.vue';
import { scrubVideo, VideoPlayerController } from '../controller';

@Options({
	components: {
		AppTouch,
	},
})
export default class AppVideoPlayerScrubber extends Vue {
	@Prop(propRequired(Object)) player!: VideoPlayerController;

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
