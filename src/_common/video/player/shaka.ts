import * as shaka from 'shaka-player';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { propRequired } from '../../../utils/vue';
import { VideoPlayerController } from './controller';

@Component({})
export default class AppVideoPlayerShaka extends Vue {
	@Prop(propRequired(VideoPlayerController)) player!: VideoPlayerController;

	$refs!: {
		video: HTMLVideoElement;
	};

	mounted() {
		shaka.polyfill.installAll();
		if (shaka.Player.isBrowserSupported()) {
			this.initShaka();
			this.syncWithState();
		} else {
			// TODO: Do something, ignore?
			console.error('Browser not supported.');
		}
	}

	private async initShaka() {
		const shakaPlayer = new shaka.Player(this.$refs.video);
		shakaPlayer.addEventListener('error', onErrorEvent);

		try {
			await shakaPlayer.load(this.player.manifest);
			this.setupEvents();
		} catch (e) {
			onError(e);
		}

		function onErrorEvent(event: any) {
			onError(event.detail);
		}

		function onError(error: any) {
			console.error('Error code', error.code, 'object', error);
		}
	}

	private setupEvents() {
		const { video } = this.$refs;

		// video.addEventListener('play', () => (this.player.isPlaying = true));
		video.addEventListener('pause', () => (this.player.isPaused = true));

		video.addEventListener('durationchange', () => {
			if (video.duration) {
				this.player.duration = video.duration * 1000;
			}
		});

		video.addEventListener(
			'timeupdate',
			() => (this.player.currentTime = video.currentTime * 1000)
		);
	}

	@Watch('player.isPaused')
	@Watch('player.volume')
	@Watch('player.queuedTimeChange')
	syncWithState() {
		const { video } = this.$refs;

		if (this.player.isPaused !== video.paused) {
			if (this.player.isPaused) {
				video.pause();
			} else {
				video.play();
			}
		}

		if (this.player.volume !== video.volume) {
			video.volume = this.player.volume;
		}

		if (this.player.queuedTimeChange !== null) {
			const time = this.player.queuedTimeChange;
			// We store in milliseconds, HTMLMediaElement works in seconds.
			video.currentTime = time / 1000;
			this.player.currentTime = time;
			this.player.queuedTimeChange = null;
		}
	}
}
