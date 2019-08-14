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

	private resize$: Subscription | undefined;
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
					height: this.height,
					maxWidth: this.maxWidth ? this.maxWidth + 'px' : undefined,
				},
			},
			this.$slots.default
		);
	}

	@Watch('ratio')
	private updateDimensions() {
		let isFilled = true;
		let containerWidth = Ruler.width(this.$el.parentNode as HTMLElement);

		if (this.maxWidth && containerWidth > this.maxWidth) {
			containerWidth = this.maxWidth;
			isFilled = false;
		}

		const height = containerWidth / this.ratio;
		this.height = `${height}px`;
		this.$emit(
			'change',
			new AppResponsiveDimensionsChangeEvent(containerWidth, height, isFilled)
		);
	}
}
