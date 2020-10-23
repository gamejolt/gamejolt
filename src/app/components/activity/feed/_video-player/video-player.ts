import Vue from 'vue';
import { Component, Emit, Prop, Watch } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import { SettingVideoPlayerFeedAutoplay } from '../../../../../_common/settings/settings.service';
import {
	setVideoVolume,
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

	get shouldShowUI() {
		return Screen.isMobile || this.isHovered || this.player.state === 'paused';
	}

	get remainingTime() {
		return Math.ceil((this.player.duration - this.player.currentTime) / 1000) + 's';
	}

	get currentTime() {
		return Math.floor(this.player.currentTime / 1000);
	}

	@Emit('play') emitPlay() {}
	@Emit('time') emitTime(_timestamp: number) {}

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
		if (this.player.state === 'playing') {
			this.player.state = 'paused';
			SettingVideoPlayerFeedAutoplay.set(false);
		} else {
			this.player.state = 'playing';
			SettingVideoPlayerFeedAutoplay.set(true);
		}
	}

	onClickMute() {
		if (this.player.volume === 0) {
			setVideoVolume(this.player, 100);
		} else {
			setVideoVolume(this.player, 0);
		}
	}

	@Watch('player.state')
	onStateChange() {
		if (this.player.state === 'playing') {
			this.emitPlay();
		}
	}
}
