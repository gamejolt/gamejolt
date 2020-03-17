import { Subscription } from 'rxjs/Subscription';
import Vue, { CreateElement } from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { Ruler } from '../ruler/ruler-service';
import { Screen } from '../screen/screen-service';

export class AppResponsiveDimensionsChangeEvent {
	constructor(public containerWidth: number, public height: number, public isFilled: boolean) {}
}

@Component({})
export class AppResponsiveDimensions extends Vue {
	@Prop(Number)
	ratio!: number;

	@Prop(Number)
	maxWidth?: number;

	@Prop(Number)
	maxHeight?: number;

	private resize$: Subscription | undefined;
	private width: string | null = null;
	private height = 'auto';

	mounted() {
		this.resize$ = Screen.resizeChanges.subscribe(() => this.updateDimensions());
		this.updateDimensions();
	}

	destroyed() {
		if (this.resize$) {
			this.resize$.unsubscribe();
			this.resize$ = undefined;
		}
	}

	render(h: CreateElement) {
		return h(
			'div',
			{
				style: {
					width: this.width,
					height: this.height,
					maxWidth: this.maxWidth ? this.maxWidth + 'px' : undefined,
					maxHeight: this.maxHeight ? this.maxHeight + 'px' : undefined,
				},
			},
			this.$slots.default
		);
	}

	@Watch('ratio')
	@Watch('maxWidth')
	@Watch('maxHeight')
	private updateDimensions() {
		let isFilled = true;
		let width = Ruler.width(this.$el.parentNode as HTMLElement);

		if (this.maxWidth && width > this.maxWidth) {
			width = this.maxWidth;
			isFilled = false;
		}

		let height = width / this.ratio;

		if (this.maxHeight && height > this.maxHeight) {
			height = this.maxHeight;
			isFilled = false;
			width = height * this.ratio;
		}

		this.width = `${width}px`;
		this.height = `${height}px`;
		this.$emit('change', new AppResponsiveDimensionsChangeEvent(width, height, isFilled));
	}
}
