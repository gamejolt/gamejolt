import { Player as ShakaPlayer, polyfill } from 'shaka-player';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import { VideoPlayerController } from './controller';

@Component({})
export default class AppVideoPlayerShaka extends Vue {
	@Prop(propRequired(VideoPlayerController)) player!: VideoPlayerController;
	@Prop(propOptional(Boolean, false)) autoplay!: boolean;

	private tempVolume = 0;
	private shakaPlayer?: ShakaPlayer;
	private isDestroyed = false;

	$refs!: {
		video: HTMLVideoElement;
	};

	mounted() {
		this.init();
	}

	beforeDestroy() {
		this.isDestroyed = true;
		if (this.shakaPlayer) {
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

		console.log('Shaka Configuration', this.shakaPlayer.getConfiguration());
		this.shakaPlayer.configure({
			abr: {
				// The goal is to select the 720p format by default.
				defaultBandwidthEstimate: 2_000_000,
			},
			manifest: {
				dash: {
					ignoreMinBufferTime: true,
				},
			},
		});

		this.shakaPlayer.addEventListener('error', onErrorEvent);

		if (this.player.manifests.length === 0) {
			throw new Error(`No manifests to load.`);
		}

		// We go with the first one that loads in properly. This way if DASH is
		// unsupported in the browser, we fallback to HLS.
		for (const manifest of this.player.manifests) {
			if (this.isDestroyed) {
				return;
			}

			try {
				await this.shakaPlayer.load(manifest);

				// Don't attempt to load next manifest, this one worked.
				break;
			} catch (e) {
				onError(e);
			}
		}

		function onErrorEvent(event: any) {
			onError(event.detail);
		}

		function onError(error: any) {
			console.error('Error code', error.code, 'object', error);
		}

		this.setupEvents();
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

	private tryPlayingVideo() {
		const { video } = this.$refs;
		video.play().catch(() => {
			// If autoplaying the video failed, first try setting the volume of the video to 0.
			if (this.player.volume > 0) {
				this.tempVolume = this.player.volume;
				this.player.volume = 0;
				// Changing the volume will automatically trigger this function, attempting to play the video again.
				return;
			}

			// If the autoplaying is still blocked with the volume set to 0,
			// pause the video in the player controller and reset the player volume to the initial setting.
			if (this.player.state === 'playing') {
				this.player.state = 'paused';
				this.player.volume = this.tempVolume;
				return;
			}
		});
	}

	@Watch('player.state')
	@Watch('player.volume')
	@Watch('player.queuedTimeChange')
	syncWithState() {
		const { video } = this.$refs;

		if (this.player.volume !== video.volume) {
			video.volume = this.player.volume;
		}

		if (this.player.state === 'paused' && !video.paused) {
			video.pause();
		} else if (this.player.state === 'playing' && video.paused) {
			this.tryPlayingVideo();
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
