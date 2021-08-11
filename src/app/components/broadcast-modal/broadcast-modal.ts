import { Component, Prop } from 'vue-property-decorator';
import AppContentViewer from '../../../_common/content/content-viewer/content-viewer.vue';
import { Environment } from '../../../_common/environment/environment.service';
import { FiresidePost } from '../../../_common/fireside/post/post-model';
import { $viewPostVideo } from '../../../_common/fireside/post/video/video-model';
import { AppImgResponsive } from '../../../_common/img/responsive/responsive';
import { MediaItem } from '../../../_common/media-item/media-item-model';
import { BaseModal } from '../../../_common/modal/base';
import AppModalTS from '../../../_common/modal/modal';
import { AppResponsiveDimensions } from '../../../_common/responsive-dimensions/responsive-dimensions';
import { StickerTargetController } from '../../../_common/sticker/target/target-controller';
import AppStickerTarget from '../../../_common/sticker/target/target.vue';
import { AppTimeAgo } from '../../../_common/time/ago/ago';
import AppVideoEmbed from '../../../_common/video/embed/embed.vue';
import { getVideoPlayerFromSources } from '../../../_common/video/player/controller';
import AppVideoPlayer from '../../../_common/video/player/player.vue';
import AppVideo from '../../../_common/video/video.vue';
import { AppCommentWidgetLazy } from '../lazy';
import AppPollVoting from '../poll/voting/voting.vue';
import AppPostControls from '../post/controls/controls.vue';

@Component({
	components: {
		AppResponsiveDimensions,
		AppImgResponsive,
		AppVideo,
		AppVideoEmbed,
		AppVideoPlayer,
		AppTimeAgo,
		AppPollVoting,
		AppPostControls,
		AppContentViewer,
		AppStickerTarget,
		AppCommentWidgetLazy,
	},
})
export default class AppBroadcastModal extends BaseModal {
	@Prop({ type: Array, required: true })
	posts!: FiresidePost[];

	post: FiresidePost = this.posts[0];
	stickerTargetController = new StickerTargetController(this.post);

	readonly Environment = Environment;

	get video() {
		return this.post.videos[0];
	}

	declare $refs: {
		modal: AppModalTS;
	};

	getVideoController(item: MediaItem) {
		const sources = {
			mp4: item.mediaserver_url_mp4,
			webm: item.mediaserver_url_webm,
		};
		return getVideoPlayerFromSources(sources, 'gif', item.mediaserver_url);
	}

	onVideoPlay() {
		if (this.video) {
			$viewPostVideo(this.video);
		}
	}
}
