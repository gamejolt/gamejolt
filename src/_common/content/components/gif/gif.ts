import { ResizeObserver } from 'resize-observer';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { Screen } from '../../../screen/screen-service';
import { AppScrollInview } from '../../../scroll/inview/inview';
import AppBaseContentComponent from '../base/base-content-component.vue';

@Component({
	components: {
		AppBaseContentComponent,
		AppScrollInview,
	},
	directives: {},
})
export default class AppContentGif extends Vue {
	@Prop(String)
	gifId!: string;

	@Prop(Number)
	width!: number;

	@Prop(Number)
	height!: number;

	@Prop(String)
	service!: string;

	@Prop(Object)
	media!: any;

	@Prop(Boolean)
	isEditing!: boolean;

	@Prop(Boolean)
	isDisabled!: boolean;

	$refs!: {
		container: HTMLElement;
	};

	resizeObserver!: ResizeObserver;
	computedHeight = this.height;
	isInview = false;
	inviewPadding = Screen.windowHeight * 0.25;

	get containerWidth() {
		// Always have SSR fullwidth the image. We never let SSR calculate the height of the container based on the width.
		if (GJ_IS_SSR) {
			return '100%';
		}
		return this.width > 0 ? this.width + 'px' : 'auto';
	}

	get containerHeight() {
		if (GJ_IS_SSR) {
			return 'auto';
		}
		return this.computedHeight > 0 ? this.computedHeight + 'px' : 'auto';
	}

	async mounted() {
		// Observe the change to the width property, the be able to instantly recompute the height.
		// We compute the height property of the element based on the computed width to be able to set a proper placeholder.
		this.resizeObserver = new ResizeObserver(() => {
			this.setHeight();
		});
		this.resizeObserver.observe(this.$refs.container);
	}

	setHeight() {
		const width = this.$refs.container.clientWidth;
		const relWidth = width / this.width;
		this.computedHeight = this.height * relWidth;
	}

	onRemoved() {
		this.$emit('removed');
	}

	destroyed() {
		this.resizeObserver.disconnect();
	}

	onInviewChange(inview: boolean) {
		this.isInview = inview;
	}
}
