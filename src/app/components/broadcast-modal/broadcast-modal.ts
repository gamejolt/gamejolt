import { Component, Prop } from 'vue-property-decorator';
import AppContentViewer from '../../../_common/content/content-viewer/content-viewer.vue';
import { Environment } from '../../../_common/environment/environment.service';
import { FiresidePost } from '../../../_common/fireside/post/post-model';
import { AppImgResponsive } from '../../../_common/img/responsive/responsive';
import { BaseModal } from '../../../_common/modal/base';
import { AppResponsiveDimensions } from '../../../_common/responsive-dimensions/responsive-dimensions';
import AppStickerTarget from '../../../_common/sticker/target/target.vue';
import { AppTimeAgo } from '../../../_common/time/ago/ago';
import AppVideoEmbed from '../../../_common/video/embed/embed.vue';
import AppVideo from '../../../_common/video/video.vue';
import AppEventItemControls from '../event-item/controls/controls.vue';
import AppEventItemMediaTags from '../event-item/media-tags/media-tags.vue';
import AppPollVoting from '../poll/voting/voting.vue';

@Component({
	components: {
		AppResponsiveDimensions,
		AppEventItemMediaTags,
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
	@Prop({ type: Array, default: () => [] })
	posts!: FiresidePost[];

	post: FiresidePost | null = null;

	readonly Environment = Environment;

	created() {
		this.post = this.posts[0];
	}
}
