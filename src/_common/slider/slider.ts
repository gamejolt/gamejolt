import { nextTick } from 'vue';
import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { AppObserveDimensions } from '../observe-dimensions/observe-dimensions.directive';
import { Ruler } from '../ruler/ruler-service';
import { AppTooltip } from '../tooltip/tooltip-directive';

export type ScrubberStage = 'start' | 'scrub' | 'end';

/**
 * @param percent - scaled from 0 to 1
 * @param stage - the stage of the scrubber
 */
export type ScrubberCallback = {
	percent: number;
	stage: ScrubberStage;
};

@Options({
	directives: {
		AppTooltip,
		AppObserveDimensions,
	},
})
export default class AppSlider extends Vue {
	/** Expects to be scaled from 0 to 1. */
	@Prop({ type: Number, required: true })
	percent!: number;

	@Prop({ type: Boolean, required: false, default: false })
	vertical!: boolean;

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

	@Emit('scrub') emitScrub(_: ScrubberCallback) {}

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

	async mounted() {
		await nextTick();
		this.initVariables();
		this._setThumbOffset('end');
	}

	initVariables() {
		const offset = Ruler.offset(this.$refs.slider);
		this.sliderOffset = this.vertical ? offset.top : offset.left;
		this.sliderSize = this.vertical ? offset.height : offset.width;
	}

	async onMouseDown(event: MouseEvent | TouchEvent) {
		await nextTick();

		this.isDragging = true;
		this.initVariables();
		this._setThumbOffset('start', event);

		window.addEventListener('mouseup', this.onWindowMouseUp);
		window.addEventListener('mousemove', this.onWindowMouseMove);
		window.addEventListener('touchend', this.onWindowMouseUp, {
			passive: false,
		});
		window.addEventListener('touchmove', this.onWindowMouseMove, {
			passive: false,
		});
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
		window.removeEventListener('touchend', this.onWindowMouseUp);
		window.removeEventListener('touchmove', this.onWindowMouseMove);
	}

	beforeUnmount() {
		this.cleanupWindowListeners();
	}

	private _setThumbOffset(stage: ScrubberStage, event?: Event) {
		let mouseOffset = 0;
		let pageX: number | null = null;
		let pageY: number | null = null;

		if (event instanceof MouseEvent) {
			pageX = event.pageX;
			pageY = event.pageY;
		} else if (typeof window.TouchEvent !== 'undefined' && event instanceof TouchEvent) {
			// Prevent page scrolling if we got a touch event.
			event.preventDefault();

			if (event.changedTouches.length > 0) {
				pageX = event.changedTouches[0].pageX;
				pageY = event.changedTouches[0].pageY;
			}
		}

		if (pageX && pageY) {
			mouseOffset = this.vertical ? pageY : pageX;
		} else {
			mouseOffset = this.percent * this.sliderSize + this.sliderOffset;
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

		const scaledPercent = Math.min(1, Math.max(0, this.percentFull / scale));
		this.emitScrub({ percent: scaledPercent, stage: stage });
	}

	@Watch('percent')
	onVolumeChange() {
		if (this.isDragging) {
			return;
		}

		// If the slider percent changed by external means, set the thumb offset
		// to match the current slider level.
		this._setThumbOffset('end');
	}
}
