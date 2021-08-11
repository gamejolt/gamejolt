import { nextTick } from 'vue';
import { Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../utils/vue';
import { Ruler } from '../../../ruler/ruler-service';
import { AppTooltip } from '../../../tooltip/tooltip-directive';
import { ScrubberStage, scrubVideoVolume, VideoPlayerController } from '../controller';

@Options({
	directives: {
		AppTooltip,
	},
})
export default class AppVideoPlayerSlider extends Vue {
	@Prop(propRequired(VideoPlayerController)) player!: VideoPlayerController;
	@Prop(propOptional(Boolean, false)) vertical!: boolean;

	isDragging = false;

	thumbSize = 12;
	sliderSize = 128;
	thumbOffset = 0;
	private sliderOffset = 0;
	private percentFull = 0;

	declare $refs: {
		slider: HTMLElement;
		thumb: HTMLDivElement;
	};

	get sliderFilledStyling() {
		if (this.vertical) {
			return {
				top: this.sliderSize - this.thumbOffset + 'px',
				right: 0,
				bottom: 0,
				left: 0,
			};
		}

		return {
			top: 0,
			right: this.sliderSize - this.thumbOffset + 'px',
			bottom: 0,
			left: 0,
		};
	}

	get thumbStyling() {
		return {
			top: this.vertical ? this.thumbOffset + 'px' : '',
			left: !this.vertical ? this.thumbOffset + 'px' : '',
			height: this.thumbSize + 'px',
			width: this.thumbSize + 'px',
		};
	}

	get sliderStyling() {
		return {
			height: this.vertical ? this.sliderSize + 'px' : '4px',
			width: !this.vertical ? this.sliderSize + 'px' : '4px',
		};
	}

	get readableSliderPercentage() {
		return `${this.percentFull}%`;
	}

	mounted() {
		this._setThumbOffset('end');
		this.initVariables();
	}

	initVariables() {
		const offset = Ruler.offset(this.$refs.slider);
		this.sliderOffset = this.vertical ? offset.top : offset.left;
		this.sliderSize = this.vertical ? offset.height : offset.width;
	}

	async onMouseDown(event: MouseEvent) {
		await nextTick();

		this.isDragging = true;
		this.initVariables();
		this._setThumbOffset('start', event);

		window.addEventListener('mouseup', this.onWindowMouseUp);
		window.addEventListener('mousemove', this.onWindowMouseMove);
	}

	private _onMouseMove(event: MouseEvent) {
		if (!this.isDragging) {
			return;
		}
		this._setThumbOffset('scrub', event);
	}

	private _onMouseUp(event: MouseEvent) {
		if (!this.isDragging) {
			return;
		}

		this._setThumbOffset('end', event);
		this.isDragging = false;
	}

	onWindowMouseMove(event: MouseEvent) {
		this._onMouseMove(event);
	}

	onWindowMouseUp(event: MouseEvent) {
		this._onMouseUp(event);
		this.cleanupWindowListeners();
	}

	cleanupWindowListeners() {
		window.removeEventListener('mousemove', this.onWindowMouseMove);
		window.removeEventListener('mouseup', this.onWindowMouseUp);
	}

	beforeDestroy() {
		this.cleanupWindowListeners();
	}

	private _setThumbOffset(stage: ScrubberStage, event?: MouseEvent) {
		let mouseOffset = 0;

		if (event) {
			mouseOffset = this.vertical ? event.pageY : event.pageX;
		} else {
			mouseOffset = this.player.volume * this.sliderSize + this.sliderOffset;
		}

		const sliderOffsetStart = -(this.thumbSize / 2);
		const sliderOffsetEnd = sliderOffsetStart + this.sliderSize;

		this.thumbOffset = Math.max(
			sliderOffsetStart,
			Math.min(sliderOffsetEnd, mouseOffset - this.sliderOffset + sliderOffsetStart)
		);

		const scale = 100;
		this.percentFull = Math.round(
			((this.sliderSize - this.thumbOffset - this.thumbSize / 2) / this.sliderSize) * scale
		);

		// invert the value for horizontal sliders
		if (!this.vertical) {
			this.percentFull = Math.abs(this.percentFull - scale);
		}

		const scaledPercent = this.percentFull / scale;
		// set the controller volume with a scale of 0 to 1
		scrubVideoVolume(this.player, scaledPercent, stage);
	}

	@Watch('player.volume')
	onVolumeChange() {
		if (this.isDragging) {
			return;
		}

		// Set the thumbTop to match with the current volume level.
		this._setThumbOffset('end');
	}
}
