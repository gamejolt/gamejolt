import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../utils/vue';
import AppContentViewer from '../../../_common/content/content-viewer/content-viewer.vue';
import { Environment } from '../../../_common/environment/environment.service';
import { FiresidePost } from '../../../_common/fireside/post/post-model';
import { AppImgResponsive } from '../../../_common/img/responsive/responsive';
import { BaseModal } from '../../../_common/modal/base';
import AppModalTS from '../../../_common/modal/modal';
import { AppResponsiveDimensions } from '../../../_common/responsive-dimensions/responsive-dimensions';
import AppStickerTargetTS from '../../../_common/sticker/target/target';
import AppStickerTarget from '../../../_common/sticker/target/target.vue';
import { AppTimeAgo } from '../../../_common/time/ago/ago';
import AppVideoEmbed from '../../../_common/video/embed/embed.vue';
import AppVideo from '../../../_common/video/video.vue';
import AppEventItemControls from '../event-item/controls/controls.vue';
import AppPollVoting from '../poll/voting/voting.vue';

@Component({
	components: {
		AppResponsiveDimensions,
		AppImgResponsive,
		AppVideo,
		AppVideoEmbed,
		AppTimeAgo,
		AppPollVoting,
		AppEventItemControls,
		AppContentViewer,
		AppStickerTarget,
	},
})
export default class AppBroadcastModal extends BaseModal {
	@Prop(propRequired(Array)) posts!: FiresidePost[];

	// Will get assigned in created() immediately.
	post: FiresidePost = null as any;
	stickersVisible = false;

	readonly Environment = Environment;

	$refs!: {
		modal: AppModalTS;
		stickerTarget: AppStickerTargetTS;
	};

	created() {
		this.post = this.posts[0];
	}

	onPostStickersVisibilityChange(visible: boolean) {
		this.stickersVisible = visible;
		if (visible) {
			this.$refs.modal.scrollTo(0);
		}
	}

	onAllStickersHidden() {
		this.stickersVisible = false;
	}
}
