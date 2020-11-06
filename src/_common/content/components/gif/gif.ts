import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { ContentFocus } from '../../../content-focus/content-focus.service';
import { AppObserveDimensions } from '../../../observe-dimensions/observe-dimensions.directive';
import { Screen } from '../../../screen/screen-service';
import { ScrollInviewConfig } from '../../../scroll/inview/config';
import { AppScrollInview } from '../../../scroll/inview/inview';
import { VideoSourceArray } from '../../../video/video';
import AppVideo from '../../../video/video.vue';
import { ContentOwner } from '../../content-owner';
import AppBaseContentComponent from '../base/base-content-component.vue';
import { computeSize } from '../media-item/media-item';

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.windowHeight * 0.25}px` });

@Component({
	components: {
		AppBaseContentComponent,
		AppScrollInview,
		AppVideo,
	},
	directives: {
		AppObserveDimensions,
	},
})
export default class AppContentGif extends Vue {
	@Prop(propRequired(String)) gifId!: string;
	@Prop(propRequired(Number)) width!: number;
	@Prop(propRequired(Number)) height!: number;
	@Prop(propRequired(String)) service!: string;
	@Prop(propRequired(Object)) media!: any;
	@Prop(propRequired(Object)) owner!: ContentOwner;
	@Prop(propRequired(Boolean)) isEditing!: boolean;
	@Prop(propRequired(Boolean)) isDisabled!: boolean;

	$refs!: {
		container: HTMLElement;
	};

	computedHeight = this.height;
	computedWidth = this.width;
	isInview = false;
	readonly InviewConfig = InviewConfig;

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

	get shouldPlay() {
		return ContentFocus.isWindowFocused;
	}

	get videoSources(): VideoSourceArray {
		return [
			{
				type: 'video/mp4',
				src: this.media.mp4.url,
			},
			{
				type: 'video/webm',
				src: this.media.webm.url,
			},
		];
	}

	mounted() {
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

	onInviewChange(inview: boolean) {
		this.isInview = inview;
	}
}
