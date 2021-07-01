import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../utils/vue';
import AppContentViewer from '../../../../../_common/content/content-viewer/content-viewer.vue';
import { Environment } from '../../../../../_common/environment/environment.service';
import { EventItem } from '../../../../../_common/event-item/event-item.model';
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
import { ActivityFeedItem } from '../../../activity/feed/item-service';

const _kOverlayNoticeColor = '#f11a5c';
const _InviewConfig = new ScrollInviewConfig({ margin: `${Screen.height * 0.2}px` });

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
	},
	directives: {
		AppObserveDimensions,
	},
})
export default class AppPostCard extends Vue {
	@Prop(propRequired(ActivityFeedItem)) item!: ActivityFeedItem;
	@Prop(propOptional(String, null)) videoContext!: VideoPlayerControllerContext;
	@Prop(propOptional(Boolean, false)) withUser!: boolean;

	$el!: HTMLElement;
	$refs!: {
		card: HTMLElement;
	};

	readonly fuzzynumber = fuzzynumber;
	readonly InviewConfig = _InviewConfig;

	aspectRatio = 10 / 16;
	videoController: VideoPlayerController | null = null;

	isImageThinner = false;
	isVideoThinner = false;

	cardWidth = '100%';
	cardHeight = '100%';
	imageWidth = '100%';
	imageHeight = '100%';
	videoWidth = '100%';
	videoHeight = '100%';

	isBootstrapped = GJ_IS_SSR;
	isHydrated = GJ_IS_SSR;

	mounted() {
		if (this.post?.hasVideo && this.post.videos[0].postCardVideo) {
			this.videoController = new VideoPlayerController(
				this.post.videos[0].postCardVideo,
				this.videoContext
			);
			this.videoController.volume = 0;
		} else if (this.mediaItem?.is_animated) {
			const sourcesPayload = {
				mp4: this.mediaItem.mediaserver_url_mp4,
				webm: this.mediaItem.mediaserver_url_webm,
			};

			this.videoController = getVideoPlayerFromSources(sourcesPayload, 'gif');
		}

		this.calcData();
	}

	calcData() {
		const cardWidth = this.$el.offsetWidth;
		const cardHeight = this.$el.offsetHeight ?? cardWidth / this.aspectRatio;
		const cardRatio = cardWidth / cardHeight;

		this.cardWidth = cardWidth + 'px';
		this.cardHeight = cardHeight + 'px';

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

	get post() {
		if (
			this.item.feedItem instanceof EventItem &&
			this.item.feedItem.type === EventItem.TYPE_POST_ADD
		) {
			return this.item.feedItem.action as FiresidePost;
		}
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

	get pollIconColor() {
		const poll = this.post?.poll;
		for (let i = 0; i < (poll?.items.length ?? 0); i++) {
			if (poll?.items[i].is_voted) {
				return _kOverlayNoticeColor;
			}
		}
	}

	get heartIconColor() {
		if (this.post?.user_like) {
			return _kOverlayNoticeColor;
		}
	}

	get userLink() {
		return Environment.wttfBaseUrl + this.post?.user.url;
	}
}
