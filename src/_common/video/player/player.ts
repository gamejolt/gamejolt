import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { propRequired } from '../../../utils/vue';
import AppShortkey from '../../shortkey/shortkey.vue';
import {
	queueVideoTimeChange,
	setVideoVolume,
	toggleVideoPlayback,
	VideoPlayerController
} from './controller';
import AppPlayerFullscreen from './fullscreen/fullscreen.vue';
import AppPlayerPlayback from './playback/playback.vue';
import AppPlayerScrubber from './scrubber/scrubber.vue';
import AppVideoPlayerShaka from './shaka.vue';
import AppPlayerVolume from './volume/volume.vue';

const KeyShortcutsList = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'm', ' '];
type KEY_SHORTCUTS = 'ArrowUp' | 'ArrowRight' | 'ArrowDown' | 'ArrowLeft' | 'm' | ' ';

@Component({
	components: {
		AppVideoPlayerShaka,
		AppPlayerPlayback,
		AppPlayerVolume,
		AppPlayerScrubber,
		AppPlayerFullscreen,
		AppShortkey,
	},
})
export default class AppVideoPlayer extends Vue {
	@Prop(propRequired(String)) poster!: string;
	@Prop(propRequired(String)) manifest!: string;

	player = new VideoPlayerController(this.manifest, this.poster);

	onFullscreenChange() {
		this.player.isFullscreen = document.fullscreenElement === this.$el;
	}

	onKeypress(event: KeyboardEvent) {
		const { key } = event;
		if (KeyShortcutsList.includes(key)) {
			event.preventDefault();
		} else {
			return;
		}

		switch (key as KEY_SHORTCUTS) {
			case ' ':
				toggleVideoPlayback(this.player);
				break;
			// case 'm': // JODO: This might need to be done through some kind of shortkey, as it conflicts with the playlists menu.
			// 	togglePlayerMuted(this.player);
			// 	break;
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
	}

	triggerScrubRight() {
		queueVideoTimeChange(
			this.player,
			this.player.currentTime + Math.min(this.player.duration / 4, 5000)
		);
	}

	triggerVolumeDown() {
		setVideoVolume(this.player, Math.round(Math.max(this.player.volume - 0.1, 0) * 100) / 100);
	}

	triggerVolumeUp() {
		setVideoVolume(this.player, Math.round(Math.min(this.player.volume + 0.1, 1) * 100) / 100);
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
}
