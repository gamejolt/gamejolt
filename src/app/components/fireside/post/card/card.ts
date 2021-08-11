import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { PostOpenSource, trackPostOpen } from '../../../../../_common/analytics/analytics.service';
import { ContentFocus } from '../../../../../_common/content-focus/content-focus.service';
import AppContentViewer from '../../../../../_common/content/content-viewer/content-viewer.vue';
import { Environment } from '../../../../../_common/environment/environment.service';
import AppFadeCollapse from '../../../../../_common/fade-collapse/fade-collapse.vue';
import { fuzzynumber } from '../../../../../_common/filters/fuzzynumber';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { AppImgResponsive } from '../../../../../_common/img/responsive/responsive';
import AppJolticon from '../../../../../_common/jolticon/jolticon.vue';
import AppLoading from '../../../../../_common/loading/loading.vue';
import AppMediaItemBackdrop from '../../../../../_common/media-item/backdrop/backdrop.vue';
import { MediaItem } from '../../../../../_common/media-item/media-item-model';
import { AppObserveDimensions } from '../../../../../_common/observe-dimensions/observe-dimensions.directive';
import { AppResponsiveDimensions } from '../../../../../_common/responsive-dimensions/responsive-dimensions';
import { Screen } from '../../../../../_common/screen/screen-service';
import { ScrollInviewConfig } from '../../../../../_common/scroll/inview/config';
import { AppScrollInview } from '../../../../../_common/scroll/inview/inview';
import AppUserAvatar from '../../../../../_common/user/user-avatar/user-avatar.vue';
import {
	getVideoPlayerFromSources,
	VideoPlayerController,
	VideoPlayerControllerContext,
} from '../../../../../_common/video/player/controller';
import AppVideo from '../../../../../_common/video/video.vue';

const _InviewConfig = new ScrollInviewConfig({ margin: `${Screen.height}px` });

export const AppPostCardAspectRatio = 10 / 16;

@Component({
	components: {
		AppContentViewer,
		AppImgResponsive,
		AppJolticon,
		AppLoading,
		AppMediaItemBackdrop,
		AppResponsiveDimensions,
		AppScrollInview,
		AppUserAvatar,
		AppVideo,
		AppFadeCollapse,
	},
	directives: {
		AppObserveDimensions,
	},
})
export default class AppPostCard extends Vue {
	@Prop({ type: FiresidePost, required: true })
	post!: FiresidePost;

	@Prop({ type: String, required: true })
	source!: PostOpenSource;

	@Prop({ type: String, required: false, default: null })
	videoContext!: VideoPlayerControllerContext;

	@Prop({ type: Boolean, required: false, default: false })
	withUser!: boolean;

	declare $el: HTMLElement;
	declare $refs: {
		card: HTMLElement;
	};

	readonly GJ_IS_SSR = GJ_IS_SSR;
	readonly fuzzynumber = fuzzynumber;
	readonly InviewConfig = _InviewConfig;

	readonly aspectRatio = AppPostCardAspectRatio;

	videoController: VideoPlayerController | null = null;

	isImageThinner = false;
	isVideoThinner = false;

	cardWidth = '100%';
	cardHeight = '100%';
	imageWidth = '100%';
	imageHeight = '100%';
	videoWidth = '100%';
	videoHeight = '100%';
	leadHeight = 0;

	isBootstrapped = GJ_IS_SSR;
	isHydrated = GJ_IS_SSR;

	get shouldPlayVideo() {
		return this.isHydrated && ContentFocus.hasFocus;
	}

	get mediaItem() {
		if (this.post?.hasMedia) {
			return this.post.media[0];
		} else if (this.post?.hasVideo) {
			return this.post.videos[0].posterMediaItem;
		}
	}

	get video() {
		if (!this.post?.hasVideo) {
			return;
		}

		return this.post?.videos[0].media.find(i => i.type == MediaItem.TYPE_TRANSCODED_VIDEO_CARD);
	}

	get votedOnPoll() {
		const poll = this.post?.poll;
		for (let i = 0; i < (poll?.items.length ?? 0); i++) {
			if (poll?.items[i].is_voted) {
				return true;
			}
		}
		return false;
	}

	get likedPost() {
		if (this.post?.user_like) {
			return true;
		}
		return false;
	}

	get userLink() {
		return Environment.wttfBaseUrl + this.post?.user.url;
	}

	mounted() {
		this.calcData();
	}

	async calcData() {
		// Safari browsers don't always get the right initial dimensions if we don't do this.
		await this.$nextTick();

		const cardWidth = this.$el.offsetWidth;
		const cardHeight = this.$el.offsetHeight ?? cardWidth / this.aspectRatio;
		const cardRatio = cardWidth / cardHeight;

		this.cardWidth = cardWidth + 'px';
		this.cardHeight = cardHeight + 'px';

		// Add in some space for the details on the bottom.
		this.leadHeight = cardHeight - 40;

		const media = this.mediaItem;
		if (!media) {
			return;
		}

		const mediaWidth = media.croppedWidth;
		const mediaHeight = media.croppedHeight;
		const mediaRatio = mediaWidth / mediaHeight;
		this.isImageThinner = mediaRatio < cardRatio;

		if (this.video) {
			const videoWidth = this.video.croppedWidth;
			const videoHeight = this.video.croppedHeight;
			const videoRatio = videoWidth / videoHeight;

			this.isVideoThinner = videoRatio < cardRatio;
		}

		const posterRatio = media.croppedWidth / media.croppedHeight;
		const videoRatio = this.video
			? this.video.croppedWidth / this.video.croppedHeight
			: posterRatio;

		let width;
		let height;

		let videoWidth;
		let videoHeight;

		if (this.isImageThinner) {
			width = cardWidth;
			height = width / posterRatio;
		} else {
			height = cardHeight;
			width = height * posterRatio;
		}

		if (this.isVideoThinner) {
			videoWidth = cardWidth;
			videoHeight = videoWidth / videoRatio;
		} else {
			videoHeight = cardHeight;
			videoWidth = videoHeight * videoRatio;
		}

		this.imageWidth = width + 'px';
		this.imageHeight = height + 'px';
		this.videoWidth = videoWidth + 'px';
		this.videoHeight = videoHeight + 'px';
	}

	inView() {
		this.isBootstrapped = true;
		this.isHydrated = true;
	}

	outView() {
		this.isHydrated = false;
	}

	@Watch('shouldPlayVideo')
	setupVideoController() {
		if (this.videoController) {
			return;
		}

		if (this.post?.hasVideo && this.post.videos[0].postCardVideo) {
			this.videoController = new VideoPlayerController(
				this.post.videos[0].postCardVideo,
				this.videoContext
			);

			this.videoController.volume = 0;
			this.videoController.muted = true;
		} else if (this.mediaItem?.is_animated) {
			const sourcesPayload = {
				mp4: this.mediaItem.mediaserver_url_mp4,
				webm: this.mediaItem.mediaserver_url_webm,
			};

			this.videoController = getVideoPlayerFromSources(sourcesPayload, 'gif');
		}
	}

	trackPostOpen() {
		trackPostOpen({ source: this.source });
	}
}
