import Vue from 'vue';
import { Component, Emit, Prop, Watch } from 'vue-property-decorator';
import { propRequired } from '../../../utils/vue';
import { Ruler } from '../../ruler/ruler-service';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import { PlayerController, setPlayerControllerTimestamp } from '../controller';

if (!GJ_IS_SSR) {
	const VueTouch = require('vue-touch');
	Vue.use(VueTouch);
}

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppPlayerScrubber extends Vue {
	@Prop(propRequired(PlayerController)) player!: PlayerController;

	isDragging = false;
	private startX = 0;
	private timebarLeft = 0;
	private timebarWidth = 0;
	private scrubPos = -1;

	$refs!: {
		timebar: HTMLDivElement;
	};

	@Emit('scrub') emitScrub(_timestamp: number) {}
	@Emit('scrub-finish') emitScrubFinish(_timestamp: number) {}

	get duration() {
		return this.player.duration;
	}

	get currentTime() {
		return this.player.currentTime;
	}

	get readableScrubberTime() {
		return this._createReadableTimestamp(this.currentTime);
	}

	get unfilledRight() {
		if (this.scrubPos !== -1) {
			return 100 - this.scrubPos * 100 + '%';
		}

		if (!this.duration) {
			return 'auto';
		}

		return 100 - (this.currentTime / this.duration) * 100 + '%';
	}

	private _createReadableTimestamp(time: number) {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60)
			.toString()
			.padStart(2, '0');

		return `${minutes}:${seconds}`;
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
			this.scrubPos = this.player.currentTime / this.player.duration;
		}
	}

	async tap(event: HammerInput) {
		// panStart will add a '-dragging' class, disabling transitions to make things feel snappy.
		this.panStart(event);

		// Let things move into place.
		await this.$nextTick();

		// panEnd will remove the class, re-enabling the transition that smooths out the scrubber movement.
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
		this.emitScrub(this.scrubPos * this.player.duration);

		// Will tell the browser to not select text while dragging.
		event.preventDefault();
	}

	panEnd() {
		this.isDragging = false;
		this.emitScrubFinish(this.scrubPos * this.player.duration);
	}

	private calcScrubPos(event: HammerInput) {
		const timebar = this.$refs.timebar as HTMLElement;
		if (!this.isDragging || !timebar) {
			return;
		}

		this.scrubPos = (this.startX - this.timebarLeft + event.deltaX) / this.timebarWidth;
		this.scrubPos = Math.max(Math.min(this.scrubPos, 1), 0);
		setPlayerControllerTimestamp(this.player, this.scrubPos * this.player.duration);
	}
}
