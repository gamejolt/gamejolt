import { Player as ShakaPlayer, polyfill } from 'shaka-player';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import { trackVideoPlayerEvent, VideoPlayerController } from './controller';

type ShakaTrack = {
	active: boolean;
	// bandwidth: number;
	id: number;
	// audioBandwidth: number;
	videoBandwidth: number;
};

@Component({})
export default class AppVideoPlayerShaka extends Vue {
	@Prop(propRequired(VideoPlayerController)) player!: VideoPlayerController;
	@Prop(propOptional(Boolean, false)) autoplay!: boolean;

	/**
	 * If their browser settings block autoplaying with audio, then the browser
	 * will never autoplay the video since it's not set to be muted. We will try
	 * autoplaying "muted" just to see if that works. We don't want to do that
	 * everywhere, so it's an opt-in behavior through a prop.
	 */
	@Prop(propOptional(Boolean, false)) allowDegradedAutoplay!: boolean;

	private shakaPlayer?: ShakaPlayer;
	private isDestroyed = false;
	private previousState: ShakaTrack | null = null;
	private currentState: ShakaTrack | null = null;
	private videoStartTime = 0;

	$refs!: {
		video: HTMLVideoElement;
	};

	get shouldAutoplay() {
		return this.autoplay;
	}

	mounted() {
		this.init();
	}

	beforeDestroy() {
		this.trackPlaytime();
		this.isDestroyed = true;
		if (this.shakaPlayer) {
			this.shakaPlayer.destroy();
			this.shakaPlayer = undefined;
		}
	}

	private async init() {
		polyfill.installAll();
		if (!ShakaPlayer.isBrowserSupported()) {
			trackVideoPlayerEvent(this.player, 'browser-unsupported');
			console.error('Browser not supported for video streaming.');
			return;
		}

		// Sync the video muted state with the player state.
		this.syncMuted();

		// We sync volume before loading in the media so that nothing plays
		// louder/quieter than they want.
		this.syncVolume();

		this.shakaPlayer = new ShakaPlayer(this.$refs.video);

		// console.log('Shaka Configuration', this.shakaPlayer.getConfiguration());
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

		const onErrorEvent = (event: any) => onError(event.detail);
		const onError = (error: any) => console.error('Error code', error.code, 'object', error);

		this.shakaPlayer.addEventListener('error', onErrorEvent);

		if (this.player.manifests.length === 0) {
			throw new Error(`No manifests to load.`);
		}

		let manifestType: string | undefined;

		// We go with the first one that loads in properly. This way if DASH is
		// unsupported in the browser, we fallback to HLS.
		for (const manifest of this.player.manifests) {
			if (this.isDestroyed) {
				return;
			}

			try {
				await this.shakaPlayer.load(manifest);
				manifestType = manifest.split('.').pop();
				// Don't attempt to load next manifest, this one worked.
				break;
			} catch (e) {
				onError(e);
			}
		}

		if (!manifestType) {
			trackVideoPlayerEvent(this.player, 'load-manifest-failed');
			return;
		}
		trackVideoPlayerEvent(this.player, 'load-manifest', manifestType);

		this.setupEvents();

		// Sync up the rest of the state after loading the sources.
		this.syncTime();
		this.syncPlayState();
	}

	private setupEvents() {
		if (this.isDestroyed || !this.shakaPlayer) {
			return;
		}

		const { video } = this.$refs;

		video.addEventListener('play', () => {
			this.player.state = 'playing';
			this.videoStartTime = Date.now();
		});
		video.addEventListener('pause', () => {
			this.player.state = 'paused';
			this.trackPlaytime();
		});
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

		this.shakaPlayer.addEventListener('adaptation', () => {
			const tracks: ShakaTrack[] = this.shakaPlayer!.getVariantTracks();

			if (this.currentState) {
				this.previousState = this.currentState;
			}

			this.currentState = tracks.find(i => i.active) || null;

			if (this.previousState && this.currentState) {
				const prev = this.previousState;
				const next = this.currentState;

				if (prev === next) {
					return;
				}

				let eventAction =
					prev.videoBandwidth < next.videoBandwidth ? 'increase-' : 'decrease-';
				eventAction += Math.abs(prev.id - next.id);

				if (!eventAction) {
					return;
				}

				trackVideoPlayerEvent(
					this.player,
					'bitrate-change',
					eventAction,
					`${next.videoBandwidth}`
				);
			}
		});
	}

	private trackPlaytime() {
		if (!this.videoStartTime) {
			return;
		}

		const playtime = Date.now() - this.videoStartTime;
		const loops = Math.floor(playtime / this.player.duration);
		trackVideoPlayerEvent(this.player, 'watched', 'playtime', `${Math.ceil(playtime / 1000)}`);
		trackVideoPlayerEvent(this.player, 'watched', 'loops', `${loops}`);
		this.videoStartTime = 0;
	}

	private async tryPlayingVideo() {
		const { video } = this.$refs;
		if (!video) {
			return;
		}

		const startVolume = this.player.volume;
		try {
			await video.play();
			return;
		} catch {}

		if (!this.allowDegradedAutoplay) {
			this.player.state = 'paused';
			return;
		}

		// If autoplaying the video failed, first try setting the volume of
		// the video to 0.
		if (startVolume > 0) {
			this.player.volume = 0;
			await this.$nextTick();
		}

		try {
			await video.play();
			return;
		} catch {}

		// If the autoplaying is still blocked with the volume set to 0,
		// pause the video in the player controller and reset the player
		// volume to the initial setting.
		this.player.state = 'paused';
		this.player.volume = startVolume;
	}

	@Watch('player.isMuted')
	syncMuted() {
		const { video } = this.$refs;
		video.muted = this.player.isMuted;
	}

	@Watch('player.volume')
	syncVolume() {
		const { video } = this.$refs;
		if (this.player.volume !== video.volume) {
			video.volume = this.player.volume;
		}
	}

	@Watch('player.queuedPlaybackChange')
	syncPlayState() {
		if (this.player.queuedPlaybackChange === null) {
			return;
		}

		const { video } = this.$refs;
		if (this.player.queuedPlaybackChange === 'paused' && !video.paused) {
			video.pause();
		} else if (this.player.queuedPlaybackChange === 'playing' && video.paused) {
			this.tryPlayingVideo();
		}
		this.player.queuedPlaybackChange = null;
	}

	@Watch('player.queuedTimeChange')
	syncTime() {
		const { video } = this.$refs;
		if (this.player.queuedTimeChange !== null) {
			const time = this.player.queuedTimeChange;
			this.player.currentTime = time;
			this.player.queuedTimeChange = null;

			// We store in milliseconds, HTMLMediaElement works in seconds.
			video.currentTime = time / 1000;
		}
	}
}
