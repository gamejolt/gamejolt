import Vue from 'vue';
import { Component, Emit, Prop, Watch } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../../utils/vue';
import { Screen } from '../../../../../_common/screen/screen-service';
import {
	SettingVideoPlayerFeedAutoplay,
	SettingVideoPlayerFeedForceMute,
} from '../../../../../_common/settings/settings.service';
import {
	queueVideoTimeChange,
	setVideoVolume,
	VideoPlayerController,
} from '../../../../../_common/video/player/controller';
import AppVideoPlayerShaka from '../../../../../_common/video/player/shaka.vue';

@Component({
	components: {
		AppVideoPlayerShaka,
	},
})
export default class AppActivityFeedVideoPlayer extends Vue {
	@Prop(propRequired(String)) poster!: string;
	@Prop(propRequired(String)) manifest!: string;
	@Prop(propOptional(Boolean, false)) isFocused!: boolean;
	@Prop(propOptional(Boolean, false)) autoplay!: boolean;
	@Prop(propOptional(Number, 0)) startTime!: number;

	player = new VideoPlayerController(this.manifest, this.poster);
	isHovered = false;

	readonly Screen = Screen;

	get shouldShowUI() {
		return (
			Screen.isMobile ||
			(this.isFocused && (this.isHovered || this.player.state === 'paused'))
		);
	}

	get remainingTime() {
		return Math.ceil((this.player.duration - this.player.currentTime) / 1000) + 's';
	}

	@Emit('play') emitPlay() {}

	mounted() {
		if (this.startTime) {
			queueVideoTimeChange(this.player, this.startTime);
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
			SettingVideoPlayerFeedForceMute.set(false);
			setVideoVolume(this.player, 100);
		} else {
			SettingVideoPlayerFeedForceMute.set(true);
			setVideoVolume(this.player, 0);
		}
	}

	@Watch('player.state')
	onStateChange() {
		if (this.player.state === 'playing') {
			this.emitPlay();
		}
	}

	@Watch('isFocused')
	onFocusChange() {
		if (!this.isFocused) {
			this.player.state = 'paused';
			return;
		}

		if (SettingVideoPlayerFeedAutoplay.get()) {
			this.player.state = 'playing';
		} else {
			this.player.state = 'paused';
		}

		if (SettingVideoPlayerFeedForceMute.get()) {
			this.player.volume = 0;
		} else {
			this.player.volume = 1;
		}
	}
}
