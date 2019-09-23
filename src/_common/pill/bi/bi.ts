import { ResizeObserver } from 'resize-observer';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Ruler } from '../../ruler/ruler-service';

@Component({})
export default class AppPillBi extends Vue {
	@Prop(Object)
	toLeft?: any;

	@Prop(Object)
	toRight?: any;

	@Prop({ type: Number, default: 20 })
	separatorWidth!: number;

	resizeObserver!: ResizeObserver;
	height = 0;

	get leftComponent() {
		return this.toLeft ? 'router-link' : 'div';
	}

	get rightComponent() {
		return this.toRight ? 'router-link' : 'div';
	}

	get hasLeftImg() {
		return !!this.$slots['left-img'];
	}

	get hasRightImg() {
		return !!this.$slots['right-img'];
	}

	get separatorWidthPx() {
		return `${this.separatorWidth}px`;
	}

	get separatorSkewX() {
		const deg = (Math.atan2(this.separatorWidth, this.height) * 180) / Math.PI;
		return `skewX(-${deg}deg)`;
	}

	mounted() {
		this.resizeObserver = new ResizeObserver(() => {
			this.recalcDimensions();
		});
		this.resizeObserver.observe(this.$el);
	}

	destroyed() {
		this.resizeObserver.disconnect();
	}

	recalcDimensions() {
		this.height = Ruler.height(this.$el as HTMLElement);
	}
}
