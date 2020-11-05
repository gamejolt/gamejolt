import Vue from 'vue';
import { Component, Emit, Inject, Prop, Watch } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { ContentFocus } from '../../../../../_common/content-focus/content-focus.service';
import { AppImgResponsive } from '../../../../../_common/img/responsive/responsive';
import AppMediaItemBackdrop from '../../../../../_common/media-item/backdrop/backdrop.vue';
import { MediaItem } from '../../../../../_common/media-item/media-item-model';
import {
	AppResponsiveDimensions,
	AppResponsiveDimensionsChangeEvent,
} from '../../../../../_common/responsive-dimensions/responsive-dimensions';
import { Screen } from '../../../../../_common/screen/screen-service';
import { ScrollInviewController } from '../../../../../_common/scroll/inview/controller';
import { AppScrollInview } from '../../../../../_common/scroll/inview/inview';
import { SettingVideoPlayerFeedAutoplay } from '../../../../../_common/settings/settings.service';
import {
	scrubVideoVolume,
	toggleVideoPlayback,
	trackVideoPlayerEvent,
	VideoPlayerController,
} from '../../../../../_common/video/player/controller';
import { AppVideoPlayerShakaLazy } from '../../../lazy';
import { ActivityFeedItem } from '../item-service';
import { InviewConfigFocused } from '../item/item';
import { ActivityFeedKey, ActivityFeedView } from '../view';

/**
 * How much time in ms to wait before loading the video player in once this item
 * becomes focused. We delay the load so if they're scrolling through the feed
 * fast we're not loading a ton video players in and slowing down the feed.
 */
const LoadDelay = 300;

@Component({
	components: {
		AppScrollInview,
		AppVideoPlayerShakaLazy,
		AppImgResponsive,
		AppResponsiveDimensions,
		AppMediaItemBackdrop,
	},
})
export default class AppActivityFeedVideoPlayer extends Vue {
	@Prop(propRequired(ActivityFeedItem)) feedItem!: ActivityFeedItem;
	@Prop(propRequired(Array)) manifests!: string[];
	@Prop(propRequired(MediaItem)) mediaItem!: MediaItem;
	@Inject(ActivityFeedKey) feed!: ActivityFeedView;

	autoplay = SettingVideoPlayerFeedAutoplay.get();
	player: VideoPlayerController | null = null;
	isHovered = false;

	private responsiveHeight = -1;
	private responsiveWidth = -1;

	shouldLoadVideo = false;
	shouldLoadVideoTimer: null | NodeJS.Timer = null;

	readonly InviewConfigFocused = InviewConfigFocused;
	readonly focusedController = new ScrollInviewController();
	readonly Screen = Screen;

	get height() {
		return GJ_IS_SSR ? null : `${this.responsiveHeight}px`;
	}

	get width() {
		return GJ_IS_SSR ? null : `${this.responsiveWidth}px`;
	}

	get maxPlayerHeight() {
		if (GJ_IS_SSR) {
			return;
		}

		if (Screen.isMobile) {
			window.screen.height * 0.45;
		}
		return Screen.height * 0.45;
	}

	private get shouldshowGeneralControls() {
		return Screen.isMobile || this.isHovered || this.player?.state === 'paused';
	}

	get shouldShowPlaybackControl() {
		if (!this.contentHasFocus) {
			return false;
		}
		return this.shouldshowGeneralControls;
	}

	get shouldShowMuteControl() {
		return this.shouldshowGeneralControls || this.player?.volume === 0;
	}

	get remainingTime() {
		if (!this.player) {
			return null;
		}
		return Math.ceil((this.player.duration - this.player.currentTime) / 1000) + 's';
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

		scrubVideoVolume(this.player, this.player.volume ? 0 : 1, 'end');
		trackVideoPlayerEvent(
			this.player,
			!this.player.volume ? 'mute' : 'unmute',
			'click-control'
		);
	}

	mounted() {
		this.onIsFocusedChange();
	}

	beforeDestroy() {
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
