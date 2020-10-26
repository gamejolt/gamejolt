import Vue from 'vue';
import { Component, Emit, Prop, Watch } from 'vue-property-decorator';
import { AppVideoPlayerShakaLazy } from '../../../app/components/lazy';
import { propOptional, propRequired } from '../../../utils/vue';
import AppShortkey from '../../shortkey/shortkey.vue';
import {
	queueVideoTimeChange,
	setVideoVolume,
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

function createReadableTimestamp(time: number) {
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
		AppShortkey,
	},
})
export default class AppVideoPlayer extends Vue {
	@Prop(propRequired(String)) poster!: string;
	@Prop(propRequired(Array)) manifests!: string[];
	@Prop(propOptional(Boolean, false)) autoplay!: boolean;
	@Prop(propOptional(Number, 0)) startTime!: number;
	@Prop(propOptional(String, null)) context!: VideoPlayerControllerContext;

	player = new VideoPlayerController(this.poster, this.manifests, this.context);
	isHovered = false;
	private _hideUITimer?: NodeJS.Timer;

	$el!: HTMLDivElement;

	@Emit('play') emitPlay() {}

	get shouldShowUI() {
		return this.isHovered || this.player.state === 'paused';
	}

	get readableTime() {
		return (
			createReadableTimestamp(this.player.currentTime) +
			' / ' +
			createReadableTimestamp(this.player.duration)
		);
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
		setVideoVolume(this.player, Math.round(Math.max(this.player.volume - 0.1, 0) * 100) / 100);
		trackVideoPlayerEvent(this.player, 'volume-down', 'keybind');
	}

	triggerVolumeUp() {
		setVideoVolume(this.player, Math.round(Math.min(this.player.volume + 0.1, 1) * 100) / 100);
		trackVideoPlayerEvent(this.player, 'volume-up', 'keybind');
	}

	onFullscreenChange() {
		this.player.isFullscreen = document.fullscreenElement === this.$el;
	}

	@Watch('player.queuedFullScreenChange')
	syncWithState() {
		if (this.player.queuedFullScreenChange !== null) {
			if (this.player.queuedFullScreenChange) {
				this.$el.requestFullscreen();
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
