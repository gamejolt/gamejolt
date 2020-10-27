import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { propOptional } from '../../../../utils/vue';
import { Ruler } from '../../../ruler/ruler-service';
import { AppTooltip } from '../../../tooltip/tooltip-directive';
import { setVideoVolume, toggleVideoMuted, VideoPlayerController } from '../controller';

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
	calculatedThumbOffset = 0;
	private sliderOffset = 0;
	private percentFull = 0;

	$refs!: {
		slider: HTMLElement;
		thumb: HTMLDivElement;
	};

	get thumbOffset() {
		if (this.player?.isMuted) {
			return -(this.thumbSize / 2);
		}

		return this.calculatedThumbOffset;
	}

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
		if (this.player?.isMuted) {
			return '0%';
		}
		return `${this.percentFull}%`;
	}

	mounted() {
		this.syncThumbOffsetToPlayer(false);
		this.initVariables();
	}

	initVariables() {
		const offset = Ruler.offset(this.$refs.slider);
		this.sliderOffset = this.vertical ? offset.top : offset.left;
		this.sliderSize = this.vertical ? offset.height : offset.width;
	}

	async onMouseDown(event: MouseEvent) {
		if (this.player?.isMuted) {
			toggleVideoMuted(this.player);
		}
		await this.$nextTick();
		this.isDragging = true;
		this.initVariables();
		this._setThumbOffset(false, true, event);

		window.addEventListener('mouseup', this.onWindowMouseUp);
		window.addEventListener('mousemove', this.onWindowMouseMove);
	}

	private _onMouseMove(event: MouseEvent) {
		if (!this.isDragging) {
			return;
		}
		this._setThumbOffset(false, true, event);
	}

	private _onMouseUp(event: MouseEvent) {
		if (!this.isDragging) {
			return;
		}

		this._setThumbOffset(true, true, event);
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

	private syncThumbOffsetToPlayer(shouldUnmute: boolean) {
		if (this.player) {
			this._setThumbOffset(false, shouldUnmute);
		}
	}

	private _setThumbOffset(storeValue: boolean, shouldUnmute: boolean, event?: MouseEvent) {
		if (this.player?.isMuted) {
			this.calculatedThumbOffset = 0;
		}
		let mouseOffset = 0;

		if (event) {
			mouseOffset = this.vertical ? event.pageY : event.pageX;
		} else if (this.player) {
			mouseOffset = this.player.volume * this.sliderSize + this.sliderOffset;
		}

		const sliderOffsetStart = -(this.thumbSize / 2);
		const sliderOffsetEnd = sliderOffsetStart + this.sliderSize;

		this.calculatedThumbOffset = Math.max(
			sliderOffsetStart,
			Math.min(sliderOffsetEnd, mouseOffset - this.sliderOffset + sliderOffsetStart)
		);

		const scale = 100;
		this.percentFull = Math.round(
			((this.sliderSize - this.calculatedThumbOffset - this.thumbSize / 2) /
				this.sliderSize) *
				scale
		);

		// invert the value for horizontal sliders
		if (!this.vertical) {
			this.percentFull = Math.abs(this.percentFull - scale);
		}

		const scaledPercent = this.percentFull / scale;
		if (this.player) {
			// set the controller volume with a scale of 0 to 1
			setVideoVolume(
				this.player,
				scaledPercent,
				storeValue && scaledPercent !== 0,
				shouldUnmute
			);
		}
	}

	@Watch('player.volume')
	onVolumeChange() {
		if (this.isDragging) {
			return;
		}

		// Set the thumbTop to match with the current volume level.
		this.syncThumbOffsetToPlayer(true);
	}
}
