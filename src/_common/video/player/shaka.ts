import { Player as ShakaPlayer, polyfill } from 'shaka-player';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../utils/vue';
import AppVideo from '../video.vue';
import { trackVideoPlayerEvent, VideoPlayerController } from './controller';

type ShakaTrack = {
	active: boolean;
	// bandwidth: number;
	id: number;
	// audioBandwidth: number;
	videoBandwidth: number;
};

@Component({
	components: {
		AppVideo,
	},
})
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
	private video?: HTMLVideoElement;
	// Function to run after setting up Shaka.

	get shouldAutoplay() {
		return this.autoplay;
	}

	beforeDestroy() {
		this.isDestroyed = true;
		if (this.shakaPlayer) {
			this.shakaPlayer.destroy();
			this.shakaPlayer = undefined;
		}
	}

	// Returns a boolean Promise, indicating success or failure of initialization.
	async initShakaWithVideo(video: HTMLVideoElement) {
		this.video = video;
		polyfill.installAll();
		if (!ShakaPlayer.isBrowserSupported()) {
			trackVideoPlayerEvent(this.player, 'browser-unsupported');
			console.error('Browser not supported for video streaming.');
			return false;
		}

		this.shakaPlayer = new ShakaPlayer(this.video);

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
				return false;
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
			return false;
		}
		trackVideoPlayerEvent(this.player, 'load-manifest', manifestType);

		return this.setupShakaEvents();
	}

	// Returns a boolean, indicating success or failure of initialization.
	private setupShakaEvents() {
		if (this.isDestroyed || !this.shakaPlayer) {
			return false;
		}

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
		return true;
	}
}
