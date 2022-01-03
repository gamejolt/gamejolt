import { setup } from 'vue-class-component';
import { Emit, Inject, Options, Prop, Vue, Watch } from 'vue-property-decorator';
import { ContentFocus } from '../../../../../_common/content-focus/content-focus.service';
import { AppImgResponsive } from '../../../../../_common/img/responsive/responsive';
import AppLoading from '../../../../../_common/loading/loading.vue';
import AppMediaItemBackdrop from '../../../../../_common/media-item/backdrop/backdrop.vue';
import { MediaItem } from '../../../../../_common/media-item/media-item-model';
import {
	AppResponsiveDimensions,
	AppResponsiveDimensionsChangeEvent,
} from '../../../../../_common/responsive-dimensions/responsive-dimensions';
import { Screen } from '../../../../../_common/screen/screen-service';
import AppScrollInview, {
	createScrollInview,
} from '../../../../../_common/scroll/inview/inview.vue';
import {
	SettingVideoPlayerFeedAutoplay,
	SettingVideoPlayerVolume,
} from '../../../../../_common/settings/settings.service';
import {
	scrubVideoVolume,
	toggleVideoPlayback,
	trackVideoPlayerEvent,
	VideoPlayerController,
} from '../../../../../_common/video/player/controller';
import { createDenseReadableTimestamp } from '../../../../../_common/video/player/player';
import { VideoSourceArray } from '../../../../../_common/video/video';
import AppVideo from '../../../../../_common/video/video.vue';
import { AppVideoPlayerShakaLazy } from '../../../lazy';
import { ActivityFeedItem } from '../item-service';
import { ActivityFeedKey, ActivityFeedView, InviewConfigFocused } from '../view';

/**
 * How much time in ms to wait before loading the video player in once this item
 * becomes focused. We delay the load so if they're scrolling through the feed
 * fast we're not loading a ton video players in and slowing down the feed.
 */
const LoadDelay = 300;

@Options({
	components: {
		AppScrollInview,
		AppImgResponsive,
		AppResponsiveDimensions,
		AppMediaItemBackdrop,
		AppLoading,
		AppVideo,
		AppVideoPlayerShakaLazy,
	},
})
export default class AppActivityFeedVideoPlayer extends Vue {
	@Prop({ type: ActivityFeedItem, required: true })
	feedItem!: ActivityFeedItem;

	@Prop({ type: MediaItem, required: true })
	mediaItem!: MediaItem;

	@Prop({ type: Array, required: true })
	manifests!: VideoSourceArray;

	@Inject({ from: ActivityFeedKey })
	feed!: ActivityFeedView;

	autoplay = SettingVideoPlayerFeedAutoplay.get();
	player: VideoPlayerController | null = null;
	isHovered = false;

	private responsiveHeight = -1;
	private responsiveWidth = -1;

	shouldLoadVideo = false;
	shouldLoadVideoTimer: null | NodeJS.Timer = null;

	readonly InviewConfigFocused = InviewConfigFocused;
	readonly focusedController = setup(() => createScrollInview());
	readonly Screen = Screen;

	get shouldShowLoading() {
		if (this.player) {
			return (
				this.player.isLoading && (this.shouldAutoplay || this.player.state === 'playing')
			);
		}
		return true;
	}

	get height() {
		return import.meta.env.SSR ? null : `${this.responsiveHeight}px`;
	}

	get width() {
		return import.meta.env.SSR ? null : `${this.responsiveWidth}px`;
	}

	get maxPlayerHeight() {
		if (import.meta.env.SSR) {
			return;
		}

		if (Screen.isMobile) {
			window.screen.height * 0.45;
		}
		return Screen.height * 0.45;
	}

	private get shouldshowGeneralControls() {
		// Clicking on 'playback controls while the video is trying to play can end up de-syncing the player state.
		if (this.player?.isLoading) {
			return false;
		}
		return Screen.isMobile || this.isHovered || this.player?.state === 'paused';
	}

	get shouldShowPlaybackControl() {
		if (!this.contentHasFocus) {
			return false;
		}
		return this.shouldshowGeneralControls;
	}

	get isMuted() {
		if (!this.player) {
			return false;
		}
		return this.player.volume === 0 || this.player.muted;
	}

	get shouldShowMuteControl() {
		return this.shouldshowGeneralControls || this.isMuted;
	}

	get remainingTime() {
		if (!this.player) {
			return null;
		}

		return createDenseReadableTimestamp(this.player.duration - this.player.currentTime);
	}

	get currentTime() {
		if (!this.player) {
			return 0;
		}
		return Math.floor(this.player.currentTime / 1000);
	}

	get contentHasFocus() {
		return ContentFocus.hasFocus;
	}

	get shouldAutoplay() {
		return this.contentHasFocus && this.autoplay;
	}

	@Emit('play') emitPlay() {}
	@Emit('time') emitTime(_timestamp: number) {}

	onChangeDimensions(event: AppResponsiveDimensionsChangeEvent) {
		this.responsiveHeight = event.height;
		this.responsiveWidth = event.containerWidth;
	}

	onMouseOut() {
		this.isHovered = false;
	}

	onMouseIn() {
		this.isHovered = true;
	}

	onClickPlayback() {
		if (!this.player) {
			return;
		}

		if (this.player.state === 'playing') {
			SettingVideoPlayerFeedAutoplay.set(false);
		} else {
			SettingVideoPlayerFeedAutoplay.set(true);
		}

		// This function needs to come after the changes to Settings,
		// as it gets handled asynchronously through the Shaka player component.
		toggleVideoPlayback(this.player);
		trackVideoPlayerEvent(
			this.player,
			this.player.state === 'playing' ? 'play' : 'pause',
			'click-control'
		);
	}

	onClickMute() {
		if (!this.player) {
			return;
		}

		scrubVideoVolume(
			this.player,
			!this.isMuted ? 0 : Math.max(0.25, SettingVideoPlayerVolume.get()),
			'end'
		);
		this.player.muted = this.player.volume === 0;

		trackVideoPlayerEvent(this.player, this.isMuted ? 'mute' : 'unmute', 'click-control');
	}

	mounted() {
		this.onIsFocusedChange();
	}

	beforeUnmount() {
		this.clearVideoShouldLoadTimer();
	}

	@Watch('player.state')
	onStateChange() {
		if (this.player?.state === 'playing') {
			this.emitPlay();
		}
	}

	@Watch('contentHasFocus', { immediate: true })
	onContentFocusChange() {
		if (!this.player) {
			return;
		}
		if (!this.contentHasFocus) {
			toggleVideoPlayback(this.player, 'paused');
		} else if (SettingVideoPlayerFeedAutoplay.get()) {
			toggleVideoPlayback(this.player, 'playing');
		}
	}

	@Watch('currentTime')
	onCurrentTimeChange() {
		// We only emit the current time if they're watching it unmuted.
		if (this.player?.volume !== 0) {
			this.emitTime(this.currentTime);
		}
	}

	@Watch('focusedController.isFocused')
	onIsFocusedChange() {
		const isFocused = this.focusedController.isFocused;

		if (isFocused) {
			this.setVideoShouldLoadTimer();
		} else {
			this.clearVideoShouldLoadTimer();
			this.shouldLoadVideo = false;
		}
	}

	@Watch('shouldLoadVideo')
	onShouldLoadVideoChange() {
		if (this.shouldLoadVideo) {
			this.player = new VideoPlayerController(this.manifests, 'feed');
			this.autoplay = SettingVideoPlayerFeedAutoplay.get();
		} else {
			this.player = null;
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
}
