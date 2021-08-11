import Vue from 'vue';
import { Component, Emit, Prop, Watch } from 'vue-property-decorator';
import { AppVideoPlayerShakaLazy } from '../../../app/components/lazy';
import { propOptional, propRequired } from '../../../utils/vue';
import { number } from '../../filters/number';
import { AppImgResponsive } from '../../img/responsive/responsive';
import AppLoading from '../../loading/loading.vue';
import AppMediaItemBackdrop from '../../media-item/backdrop/backdrop.vue';
import { MediaItem } from '../../media-item/media-item-model';
import {
	AppResponsiveDimensions,
	AppResponsiveDimensionsChangeEvent,
} from '../../responsive-dimensions/responsive-dimensions';
import { Screen } from '../../screen/screen-service';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import { VideoSourceArray } from '../video';
import {
	queueVideoTimeChange,
	scrubVideoVolume,
	toggleVideoPlayback,
	trackVideoPlayerEvent,
	VideoPlayerController,
	VideoPlayerControllerContext,
} from './controller';
import AppPlayerFullscreen from './fullscreen/fullscreen.vue';
import AppPlayerPlayback from './playback/playback.vue';
import AppPlayerScrubber from './scrubber/scrubber.vue';
import AppPlayerVolume from './volume/volume.vue';

const KeyShortcutsList = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'm', ' '];
type KEY_SHORTCUTS = 'ArrowUp' | 'ArrowRight' | 'ArrowDown' | 'ArrowLeft' | 'm' | ' ';

/**
 * The amount of time to wait before hiding the UI after moving your mouse away
 * from the player.
 */
const UIHideTimeout = 400;

/**
 * The amount of time to wait before hiding the UI after mouse movement on the
 * player. We want the cursor to eventually hide away if they stop moving their
 * mouse essentially.
 */
const UIHideTimeoutMovement = 2000;

/**
 * Returns as format `m:ss`, or the remaining seconds with 's' appended if
 * duration is lower than 60 seconds, e.g. `1:23` or `42s`.
 *
 * @param time should be duration in milliseconds.
 */
export function createDenseReadableTimestamp(time: number) {
	time /= 1000;
	const minutes = Math.floor(time / 60);
	const displayMinutes = minutes <= 0 ? '' : `${minutes}:`;
	let seconds = Math.floor(time % 60).toString();

	// Pad the seconds with 0 while we still have minutes.
	if (minutes >= 1) {
		seconds = seconds.padStart(2, '0');
	} else {
		seconds += 's';
	}

	return `${displayMinutes}${seconds}`;
}

/**
 * Always returns as format `m:ss`, e.g. `1:23` or `0:04`.
 *
 * @param time should be duration in milliseconds.
 */
export function createReadableTimestamp(time: number) {
	time /= 1000;
	const minutes = Math.floor(time / 60);
	const seconds = Math.floor(time % 60)
		.toString()
		.padStart(2, '0');

	return `${minutes}:${seconds}`;
}

@Component({
	components: {
		AppVideoPlayerShakaLazy,
		AppPlayerPlayback,
		AppPlayerVolume,
		AppPlayerScrubber,
		AppPlayerFullscreen,
		AppLoading,
		AppResponsiveDimensions,
		AppImgResponsive,
		AppMediaItemBackdrop,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppVideoPlayer extends Vue {
	@Prop(propRequired(MediaItem)) mediaItem!: MediaItem;
	@Prop(propRequired(Array)) manifests!: VideoSourceArray;
	@Prop(propOptional(Boolean, false)) autoplay!: boolean;
	@Prop(propOptional(Number, 0)) startTime!: number;
	@Prop(propOptional(String, null)) context!: VideoPlayerControllerContext;
	@Prop(propOptional(Number, 0)) viewCount!: number;
	@Prop(propOptional(Boolean, false)) showVideoStats!: boolean;

	player = new VideoPlayerController(this.manifests, this.context);
	isHoveringControls = false;
	private isHovered = false;
	private _hideUITimer?: NodeJS.Timer;

	private responsiveHeight = -1;
	private responsiveWidth = -1;

	readonly number = number;
	readonly Screen = Screen;

	declare $el: HTMLDivElement;

	@Emit('play') emitPlay() {}

	get height() {
		return GJ_IS_SSR ? null : `${this.responsiveHeight}px`;
	}

	get width() {
		return GJ_IS_SSR ? null : `${this.responsiveWidth}px`;
	}

	get blackBarsBreakpoint() {
		if (Screen.isXs) {
			return '100%';
		} else if (Screen.isSm) {
			return '260px';
		}

		return '400px';
	}

	get shouldShowPausedIndicator() {
		return !GJ_IS_SSR && this.player.state === 'paused' && !this.player.isScrubbing;
	}

	get shouldShowUI() {
		if (GJ_IS_SSR) {
			return false;
		}
		return this.isHoveringControls || this.isHovered || this.player.state === 'paused';
	}

	get readableTime() {
		return (
			createReadableTimestamp(this.player.currentTime) +
			' / ' +
			createReadableTimestamp(this.player.duration)
		);
	}

	get shouldShowLoading() {
		if (this.player) {
			return this.player.isLoading && (this.autoplay || this.player.state === 'playing');
		}
		return true;
	}

	get playerMaxWidth() {
		return this.player.isFullscreen ? Screen.width : this.mediaItem.width;
	}

	get deviceMaxHeight() {
		if (GJ_IS_SSR) {
			return;
		}

		if (this.player.isFullscreen) {
			return Screen.height;
		}

		if (Screen.isMobile) {
			return window.screen.height - 150;
		}
		return Screen.height - 150;
	}

	get shouldShowVideoStats() {
		return this.showVideoStats && !this.player.isFullscreen;
	}

	mounted() {
		if (this.startTime) {
			queueVideoTimeChange(this.player, this.startTime);
		}

		this.$el.focus();
	}

	beforeDestroy() {
		this.clearHideUITimer();
	}

	onChangeDimensions(event: AppResponsiveDimensionsChangeEvent) {
		this.responsiveHeight = event.height;
		this.responsiveWidth = event.containerWidth;
	}

	onMouseOut() {
		this.scheduleUIHide(UIHideTimeout);
	}

	onMouseMove() {
		this.scheduleUIHide(UIHideTimeoutMovement);
	}

	private scheduleUIHide(delay: number) {
		this.isHovered = true;
		this.clearHideUITimer();
		this._hideUITimer = setTimeout(() => {
			this.isHovered = false;
			this.clearHideUITimer();
		}, delay);
	}

	private clearHideUITimer() {
		if (!this._hideUITimer) {
			return;
		}

		clearTimeout(this._hideUITimer);
		this._hideUITimer = undefined;
	}

	onVideoClick() {
		toggleVideoPlayback(this.player);
		if (this.player.state === 'playing') {
			this.scheduleUIHide(UIHideTimeout);
		}
		trackVideoPlayerEvent(
			this.player,
			this.player.state === 'playing' ? 'play' : 'pause',
			'click-video'
		);
	}

	onKeypress(event: KeyboardEvent) {
		const { key } = event;
		if (KeyShortcutsList.includes(key)) {
			event.preventDefault();
		} else {
			return;
		}

		this.scheduleUIHide(UIHideTimeoutMovement);

		switch (key as KEY_SHORTCUTS) {
			case ' ':
				toggleVideoPlayback(this.player);
				trackVideoPlayerEvent(
					this.player,
					this.player.state === 'playing' ? 'play' : 'pause',
					'keybind'
				);
				break;
			case 'ArrowLeft':
				this.triggerScrubLeft();
				break;
			case 'ArrowRight':
				this.triggerScrubRight();
				break;
			case 'ArrowDown':
				this.triggerVolumeDown();
				break;
			case 'ArrowUp':
				this.triggerVolumeUp();
				break;
		}
	}

	triggerScrubLeft() {
		queueVideoTimeChange(
			this.player,
			this.player.currentTime - Math.min(this.player.duration / 4, 5000)
		);
		trackVideoPlayerEvent(this.player, 'scrub-left', 'keybind');
	}

	triggerScrubRight() {
		queueVideoTimeChange(
			this.player,
			this.player.currentTime + Math.min(this.player.duration / 4, 5000)
		);
		trackVideoPlayerEvent(this.player, 'scrub-right', 'keybind');
	}

	triggerVolumeDown() {
		scrubVideoVolume(
			this.player,
			Math.round(Math.max(this.player.volume - 0.1, 0) * 100) / 100,
			'end'
		);
		trackVideoPlayerEvent(this.player, 'volume-down', 'keybind');
	}

	triggerVolumeUp() {
		scrubVideoVolume(
			this.player,
			Math.round(Math.min(this.player.volume + 0.1, 1) * 100) / 100,
			'end'
		);
		trackVideoPlayerEvent(this.player, 'volume-up', 'keybind');
	}

	onFullscreenChange() {
		this.player.isFullscreen = document.fullscreenElement === this.$el;
	}

	@Watch('player.queuedFullScreenChange')
	syncWithState() {
		if (this.player.queuedFullScreenChange !== null) {
			if (this.player.queuedFullScreenChange) {
				if (this.player.altControlsBehavior) {
					const video: any = this.$el.querySelector('video');
					// iOS Safari doesn't allow us to go fullscreen through our
					// preferred way, so we need to use their fullscreen method
					// and player controls instead.
					video?.webkitEnterFullscreen();
				} else {
					this.$el.requestFullscreen();
				}
			} else {
				document.exitFullscreen();
			}
			this.player.queuedFullScreenChange = null;
		}
	}

	@Watch('player.state')
	onStateChange() {
		if (this.player.state === 'playing') {
			this.emitPlay();
		}
	}
}
