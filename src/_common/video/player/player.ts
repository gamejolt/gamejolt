import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../utils/vue';
import {
	PlayerController,
	setPlayerControllerVolume,
	togglePlayerControllerPlayback,
} from '../../player/controller';
import AppPlayerFullscreen from '../../player/fullscreen/fullscreen.vue';
import AppPlayerPlayback from '../../player/playback/playback.vue';
import AppPlayerScrubber from '../../player/scrubber/scrubber.vue';
import AppPlayerVolume from '../../player/volume/volume.vue';
import AppShortkey from '../../shortkey/shortkey.vue';

const KeyShortcutsList = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft', 'm', ' '];
type KEY_SHORTCUTS = 'ArrowUp' | 'ArrowRight' | 'ArrowDown' | 'ArrowLeft' | 'm' | ' ';

@Component({
	components: {
		AppPlayerPlayback,
		AppPlayerVolume,
		AppPlayerScrubber,
		AppPlayerFullscreen,
		AppShortkey,
	},
})
export default class AppVideoPlayer extends Vue {
	@Prop(propRequired(PlayerController)) player!: PlayerController;

	onScrub(timestamp: number) {
		if (!this.player.video.paused) {
			this.player.video.pause();
		}

		this.player.video.currentTime = timestamp;
	}

	onScrubFinish(timestamp: number) {
		this.onScrub(timestamp);
		this.player.currentTime = timestamp;

		if (this.player.shouldPlay) {
			this.player.video.play();
		}
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
				togglePlayerControllerPlayback(this.player);
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
		this.onScrubFinish(
			Math.max(this.player.currentTime - Math.min(this.player.duration / 4, 5), 0)
		);
	}

	triggerScrubRight() {
		this.onScrubFinish(
			Math.min(
				this.player.currentTime + Math.min(this.player.duration / 4, 5),
				this.player.duration
			)
		);
	}

	triggerVolumeDown() {
		setPlayerControllerVolume(
			this.player,
			Math.round(Math.max(this.player.video.volume - 0.1, 0) * 100) / 100
		);
	}

	triggerVolumeUp() {
		setPlayerControllerVolume(
			this.player,
			Math.round(Math.min(this.player.video.volume + 0.1, 1) * 100) / 100
		);
	}
}
