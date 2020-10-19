import { Player as ShakaPlayer, polyfill } from 'shaka-player';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import { VideoPlayerController } from './controller';

@Component({})
export default class AppVideoPlayerShaka extends Vue {
	@Prop(propRequired(VideoPlayerController)) player!: VideoPlayerController;
	@Prop(propOptional(Boolean, false)) autoplay!: boolean;

	shakaPlayer?: ShakaPlayer;

	$refs!: {
		video: HTMLVideoElement;
	};

	mounted() {
		this.init();
	}

	beforeDestroy() {
		if (this.shakaPlayer) {
			console.log('DESTROY');
			this.shakaPlayer.destroy();
			this.shakaPlayer = undefined;
		}
	}

	private async init() {
		polyfill.installAll();
		if (!ShakaPlayer.isBrowserSupported()) {
			console.error('Browser not supported for video streaming.');
			return;
		}

		this.syncWithState();

		this.shakaPlayer = new ShakaPlayer(this.$refs.video);
		this.shakaPlayer.addEventListener('error', onErrorEvent);

		try {
			await this.shakaPlayer.load(this.player.manifest);
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

		video.addEventListener('play', () => (this.player.state = 'playing'));
		video.addEventListener('pause', () => (this.player.state = 'paused'));
		video.addEventListener('volumechange', () => (this.player.volume = video.volume));
		video.addEventListener('durationchange', () => {
			if (video.duration) {
				this.player.duration = video.duration * 1000;
			}
		});
		video.addEventListener(
			'timeupdate',
			() => (this.player.currentTime = video.currentTime * 1000)
		);
		video.addEventListener('progress', () => {
			let time = 0;
			for (let i = 0; i < video.buffered.length; ++i) {
				time = Math.max(time, video.buffered.end(i) * 1000);
			}
			this.player.bufferedTo = time;
		});
	}

	@Watch('player.state')
	@Watch('player.volume')
	@Watch('player.queuedTimeChange')
	syncWithState() {
		const { video } = this.$refs;

		if (this.player.state === 'paused' && !video.paused) {
			video.pause();
		} else if (this.player.state === 'playing' && video.paused) {
			video.play();
		}

		if (this.player.volume !== video.volume) {
			video.volume = this.player.volume;
		}

		if (this.player.queuedTimeChange !== null) {
			const time = this.player.queuedTimeChange;
			this.player.currentTime = time;
			this.player.queuedTimeChange = null;

			// We store in milliseconds, HTMLMediaElement works in seconds.
			video.currentTime = time / 1000;
		}
	}
}
