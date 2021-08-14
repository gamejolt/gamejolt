import { h } from 'vue';
import { Emit, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { Ruler } from '../ruler/ruler-service';
import { onScreenResize } from '../screen/screen-service';
import { EventSubscription } from '../system/event/event-topic';

export class AppResponsiveDimensionsChangeEvent {
	constructor(public containerWidth: number, public height: number, public isFilled: boolean) {}
}

@Options({})
export class AppResponsiveDimensions extends Vue {
	@Prop(Number)
	ratio!: number;

	@Prop(Number)
	maxWidth?: number;

	@Prop(Number)
	maxHeight?: number;

	private resize$: EventSubscription | undefined;
	private width: string | null = null;
	private height = 'auto';

	@Emit('change')
	emitChange(_event: AppResponsiveDimensionsChangeEvent) {}

	mounted() {
		this.resize$ = onScreenResize.subscribe(() => this.updateDimensions());
		this.updateDimensions();
	}

	unmounted() {
		this.resize$?.close();
	}

	render() {
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
		this.emitChange(new AppResponsiveDimensionsChangeEvent(width, height, isFilled));
	}
}
