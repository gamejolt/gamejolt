import Vue from 'vue';
import { Component, Emit, Prop, Watch } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { ContentFocus } from '../../../../../_common/content-focus/content-focus.service';
import { Screen } from '../../../../../_common/screen/screen-service';
import { SettingVideoPlayerFeedAutoplay } from '../../../../../_common/settings/settings.service';
import {
	setVideoVolume,
	toggleVideoPlayback,
	trackVideoPlayerEvent,
	VideoPlayerController,
} from '../../../../../_common/video/player/controller';
import { AppVideoPlayerShakaLazy } from '../../../lazy';

@Component({
	components: {
		AppVideoPlayerShakaLazy,
	},
})
export default class AppActivityFeedVideoPlayer extends Vue {
	@Prop(propRequired(String)) poster!: string;
	@Prop(propRequired(Array)) manifests!: string[];

	autoplay = SettingVideoPlayerFeedAutoplay.get();
	player = new VideoPlayerController(this.poster, this.manifests, 'feed');
	isHovered = false;

	readonly Screen = Screen;

	get shouldShowPlaybackControl() {
		if (this.shouldForcePause) {
			return false;
		}
		return Screen.isMobile || this.isHovered || this.player.state === 'paused';
	}

	get shouldShowMuteControl() {
		return Screen.isMobile || this.isHovered || this.player.volume === 0;
	}

	get remainingTime() {
		return Math.ceil((this.player.duration - this.player.currentTime) / 1000) + 's';
	}

	get currentTime() {
		return Math.floor(this.player.currentTime / 1000);
	}

	get shouldForcePause() {
		return !ContentFocus.hasFocus;
	}

	@Emit('play') emitPlay() {}
	@Emit('time') emitTime(_timestamp: number) {}

	@Watch('shouldForcePause', { immediate: true })
	onWindowFocusChange() {
		if (this.shouldForcePause) {
			this.player.state = 'paused';
			this.player.forceState = true;
		} else if (SettingVideoPlayerFeedAutoplay.get()) {
			this.player.forceState = false;
			this.player.state = 'playing';
		}
	}

	@Watch('currentTime')
	onCurrentTimeChange() {
		// We only emit the current time if they're watching it unmuted.
		if (this.player.volume !== 0) {
			this.emitTime(this.currentTime);
		}
	}

	onMouseOut() {
		this.isHovered = false;
	}

	onMouseIn() {
		this.isHovered = true;
	}

	onClickPlayback() {
		toggleVideoPlayback(this.player);
		trackVideoPlayerEvent(
			this.player,
			this.player.state === 'playing' ? 'play' : 'pause',
			'click-control'
		);

		if (this.player.state === 'playing') {
			SettingVideoPlayerFeedAutoplay.set(true);
		} else {
			SettingVideoPlayerFeedAutoplay.set(false);
		}
	}

	onClickMute() {
		if (this.player.volume === 0) {
			setVideoVolume(this.player, 100);
		} else {
			setVideoVolume(this.player, 0);
		}

		trackVideoPlayerEvent(
			this.player,
			!this.player.volume ? 'mute' : 'unmute',
			'click-control'
		);
	}

	@Watch('player.state')
	onStateChange() {
		if (this.player.state === 'playing') {
			this.emitPlay();
		}
	}
}
