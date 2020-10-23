import Vue from 'vue';
import { Component, Emit, Inject, Prop, Watch } from 'vue-property-decorator';
import { propRequired } from '../../../../../../utils/vue';
import { FiresidePost } from '../../../../../../_common/fireside/post/post-model';
import { $viewPostVideo } from '../../../../../../_common/fireside/post/video/video-model';
import { AppImgResponsive } from '../../../../../../_common/img/responsive/responsive';
import AppMediaItemBackdrop from '../../../../../../_common/media-item/backdrop/backdrop.vue';
import { AppResponsiveDimensions } from '../../../../../../_common/responsive-dimensions/responsive-dimensions';
import { ActivityFeedItem } from '../../item-service';
import { ActivityFeedKey, ActivityFeedView } from '../../view';
import AppActivityFeedVideoEmbed from '../../_video-embed/video-embed.vue';
import AppActivityFeedVideoPlayer from '../../_video-player/video-player.vue';

/**
 * How much time in ms to wait before loading the video player in once this item
 * becomes focused. We delay the load so if they're scrolling through the feed
 * fast we're not loading a ton video players in and slowing down the feed.
 */
const LoadDelay = 500;

@Component({
	components: {
		AppActivityFeedVideoPlayer,
		AppActivityFeedVideoEmbed,
		AppResponsiveDimensions,
		AppMediaItemBackdrop,
		AppImgResponsive,
	},
})
export default class AppActivityFeedDevlogPostVideo extends Vue {
	@Prop(propRequired(ActivityFeedItem)) item!: ActivityFeedItem;
	@Prop(propRequired(FiresidePost)) post!: FiresidePost;

	@Inject(ActivityFeedKey) feed!: ActivityFeedView;

	shouldLoadVideo = false;
	shouldLoadVideoTimer: null | NodeJS.Timer = null;

	@Emit('click-video-player') emitClickVideoPlayer(_event: MouseEvent, _timestamp: number) {}

	get isHydrated() {
		return this.feed.isItemHydrated(this.item);
	}

	get isFocused() {
		return this.feed.isItemFocused(this.item);
	}

	get video() {
		return this.post.videos[0];
	}

	beforeDestroy() {
		this.clearVideoShouldLoadTimer();
	}

	@Watch('isFocused')
	onIsFocusedChange() {
		if (this.isFocused) {
			this.setVideoShouldLoadTimer();
		} else {
			this.clearVideoShouldLoadTimer();
			this.shouldLoadVideo = false;
		}
	}

	private clearVideoShouldLoadTimer() {
		if (this.shouldLoadVideoTimer) {
			clearTimeout(this.shouldLoadVideoTimer);
			this.shouldLoadVideoTimer = null;
		}
	}

	private setVideoShouldLoadTimer() {
		this.clearVideoShouldLoadTimer();
		this.shouldLoadVideoTimer = setTimeout(() => {
			this.shouldLoadVideo = true;
		}, LoadDelay);
	}

	onVideoPlay() {
		$viewPostVideo(this.video);
	}
}
