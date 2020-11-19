import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { ContentFocus } from '../../../content-focus/content-focus.service';
import { AppResponsiveDimensions } from '../../../responsive-dimensions/responsive-dimensions';
import { Screen } from '../../../screen/screen-service';
import { ScrollInviewConfig } from '../../../scroll/inview/config';
import { AppScrollInview } from '../../../scroll/inview/inview';
import { getVideoPlayerFromSources } from '../../../video/player/controller';
import AppVideo from '../../../video/video.vue';
import { ContentOwner } from '../../content-owner';
import AppBaseContentComponent from '../base/base-content-component.vue';

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.windowHeight * 0.25}px` });

@Component({
	components: {
		AppBaseContentComponent,
		AppScrollInview,
		AppVideo,
		AppResponsiveDimensions,
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

	isInview = false;
	readonly InviewConfig = InviewConfig;

	get shouldPlay() {
		return ContentFocus.isWindowFocused;
	}

	get videoController() {
		if (!this.media || !this.media.mp4.url || !this.media.webm.url) {
			return;
		}

		const sourcesPayload = {
			mp4: this.media.mp4.url,
			webm: this.media.webm.url,
		};

		return getVideoPlayerFromSources(sourcesPayload, 'gif', this.media.preview);
	}

	get maxWidth() {
		const { container } = this.$refs;
		const maxOwnerWidth = this.owner.getContentRules().maxMediaWidth;
		if (maxOwnerWidth !== null) {
			return Math.min(maxOwnerWidth, container ? container.clientWidth : this.width);
		}

		return this.width;
	}

	get maxHeight() {
		const maxOwnerHeight = this.owner.getContentRules().maxMediaHeight;
		if (maxOwnerHeight !== null) {
			return Math.min(maxOwnerHeight, this.height);
		}

		return this.height;
	}

	onRemoved() {
		this.$emit('removed');
	}

	onInviewChange(inview: boolean) {
		this.isInview = inview;
	}
}
