import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { propOptional } from '../../../../utils/vue';
import { Ruler } from '../../../ruler/ruler-service';
import { AppTooltip } from '../../../tooltip/tooltip-directive';
import { setVideoVolume, VideoPlayerController } from '../controller';

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppVideoPlayerSlider extends Vue {
	@Prop(propOptional(VideoPlayerController, null)) player!: VideoPlayerController | null;
	@Prop(propOptional(Boolean, false)) vertical!: boolean;

	isDragging = false;

	thumbSize = 12;
	sliderSize = 128;
	thumbOffset = 0;
	private sliderOffset = 0;
	private percentFull = 0;

	$refs!: {
		slider: HTMLElement;
		thumb: HTMLDivElement;
	};

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
		this.syncThumbOffsetToPlayer();
		this.initVariables();
	}

	initVariables() {
		const offset = Ruler.offset(this.$refs.slider);
		this.sliderOffset = this.vertical ? offset.top : offset.left;
		this.sliderSize = this.vertical ? offset.height : offset.width;
	}

	onMouseDown(event: MouseEvent) {
		this.isDragging = true;
		this.initVariables();
		this._setThumbOffset(event);

		window.addEventListener('mouseup', this.onWindowMouseUp);
		window.addEventListener('mousemove', this.onWindowMouseMove);
	}

	private _onMouseMove(event: MouseEvent) {
		if (!this.isDragging) {
			return;
		}
		this._setThumbOffset(event);
	}

	private _onMouseUp(event: MouseEvent) {
		if (!this.isDragging) {
			this._setThumbOffset(event);
		}

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

	private syncThumbOffsetToPlayer() {
		if (this.player) {
			this._setThumbOffset();
		}
	}

	private _setThumbOffset(event?: MouseEvent) {
		let mouseOffset = 0;

		if (event) {
			mouseOffset = this.vertical ? event.pageY : event.pageX;
		} else if (this.player) {
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

		if (this.player) {
			// set the controller volume with a scale of 0 to 1
			setVideoVolume(this.player, this.percentFull / scale);
		}
	}

	@Watch('player.volume')
	onVolumeChange() {
		if (this.isDragging) {
			return;
		}

		// Set the thumbTop to match with the current volume level.
		this.syncThumbOffsetToPlayer();
	}
}
