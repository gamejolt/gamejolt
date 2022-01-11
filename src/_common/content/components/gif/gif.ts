import { Emit, Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { ContentFocus } from '../../../content-focus/content-focus.service';
import { AppResponsiveDimensions } from '../../../responsive-dimensions/responsive-dimensions';
import { Screen } from '../../../screen/screen-service';
import AppScrollInview, { ScrollInviewConfig } from '../../../scroll/inview/inview.vue';
import { getVideoPlayerFromSources } from '../../../video/player/controller';
import AppVideo from '../../../video/video.vue';
import { ContentOwnerController, ContentOwnerControllerKey } from '../../content-owner';
import AppBaseContentComponent from '../base/base-content-component.vue';

const InviewConfig = new ScrollInviewConfig({ margin: `${Screen.height * 0.25}px` });

@Options({
	components: {
		AppBaseContentComponent,
		AppScrollInview,
		AppVideo,
		AppResponsiveDimensions,
	},
})
export default class AppContentGif extends Vue {
	@Prop({ type: String, required: true }) gifId!: string;
	@Prop({ type: Number, required: true }) width!: number;
	@Prop({ type: Number, required: true }) height!: number;
	@Prop({ type: String, required: true }) service!: string;
	@Prop({ type: Object, required: true }) media!: any;
	@Prop({ type: Boolean, required: true }) isEditing!: boolean;
	@Prop({ type: Boolean, required: true }) isDisabled!: boolean;

	@Inject({ from: ContentOwnerControllerKey })
	owner!: ContentOwnerController;

	declare $refs: {
		container: HTMLElement;
	};

	isInview = false;
	readonly InviewConfig = InviewConfig;

	@Emit('removed')
	emitRemoved() {}

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
		const maxOwnerWidth = this.owner.contentRules.maxMediaWidth;
		if (maxOwnerWidth !== null) {
			return Math.min(maxOwnerWidth, container ? container.clientWidth : this.width);
		}

		return this.width;
	}

	get maxHeight() {
		const maxOwnerHeight = this.owner.contentRules.maxMediaHeight;
		if (maxOwnerHeight !== null) {
			return Math.min(maxOwnerHeight, this.height);
		}

		return this.height;
	}

	onRemoved() {
		this.emitRemoved();
	}

	onInviewChange(inview: boolean) {
		this.isInview = inview;
	}
}
