import ResizeObserver from 'resize-observer-polyfill';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { Screen } from '../../../screen/screen-service';
import { AppScrollInview } from '../../../scroll/inview/inview';
import { ContentOwner } from '../../content-owner';
import AppBaseContentComponent from '../base/base-content-component.vue';
import { computeSize } from '../media-item/media-item';

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

	@Prop(Object)
	owner!: ContentOwner;

	@Prop(Boolean)
	isEditing!: boolean;

	@Prop(Boolean)
	isDisabled!: boolean;

	$refs!: {
		container: HTMLElement;
	};

	resizeObserver!: ResizeObserver;
	computedHeight = this.height;
	computedWidth = this.width;
	isInview = false;
	inviewMargin = Screen.windowHeight * 0.25;

	get containerWidth() {
		// Always have SSR fullwidth the image. We never let SSR calculate the height of the container based on the width.
		if (GJ_IS_SSR) {
			return '100%';
		}
		return this.computedWidth > 0 ? this.computedWidth + 'px' : 'auto';
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
			this.computeSize();
		});
		this.resizeObserver.observe(this.$refs.container);

		this.computeSize();
	}

	computeSize() {
		const maxContainerWidth = this.$refs.container.getBoundingClientRect().width;
		let maxWidth = this.owner.getContentRules().maxMediaWidth;
		if (maxWidth === null || maxWidth > maxContainerWidth) {
			maxWidth = maxContainerWidth;
		}
		const maxHeight = this.owner.getContentRules().maxMediaHeight;

		const size = computeSize(this.width, this.height, maxWidth, maxHeight);

		this.computedWidth = size.width;
		this.computedHeight = size.height;
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
