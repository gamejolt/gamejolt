import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { AppImgResponsive } from '../../../../../_common/img/responsive/responsive';
import AppMediaItemBackdrop from '../../../../../_common/media-item/backdrop/backdrop.vue';
import {
	getVideoPlayerFromSources,
	VideoPlayerController,
} from '../../../../../_common/video/player/controller';
import AppVideo from '../../../../../_common/video/video.vue';

@Component({
	components: {
		AppMediaItemBackdrop,
		AppImgResponsive,
		AppVideo,
	},
})
export default class AppHomeFsPost extends Vue {
	@Prop({ type: FiresidePost, required: true })
	post!: FiresidePost;

	videoController: VideoPlayerController | null = null;
	imgLoaded = false;

	@Emit('loaded')
	emitLoaded() {}

	get mediaItem() {
		if (this.post.hasVideo) {
			return this.post.videos[0].posterMediaItem!;
		}

		return this.post.media[0];
	}

	get video() {
		if (!this.post.hasVideo) {
			return;
		}

		return this.post.videos[0];
	}

	mounted() {
		if (this.video?.postCardVideo) {
			this.videoController = new VideoPlayerController(this.video.postCardVideo, null);

			this.videoController.volume = 0;
			this.videoController.muted = true;
		} else if (this.mediaItem?.is_animated) {
			this.videoController = getVideoPlayerFromSources(
				{
					mp4: this.mediaItem.mediaserver_url_mp4,
					webm: this.mediaItem.mediaserver_url_webm,
				},
				'gif'
			);
		}
	}

	onImageLoad(isLoaded: boolean) {
		this.imgLoaded = isLoaded;

		if (isLoaded) {
			this.emitLoaded();
		}
	}
}
