import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../utils/vue';
import AppLoading from '../loading/loading.vue';
import { trackVideoPlayerEvent, VideoPlayerController } from './player/controller';

// We have to not use Vue for video embed stuff!
// https://forum.ionicframework.com/t/ionic-2-video-video-memory-leak-garbage-collection-solved/52333
// Massive memory leaks if we don't keep this out of Vue and finely tuned.

export type VideoSourceArray = Array<VideoSourceObject>;
type VideoSourceObject = {
	type: string;
	src: string;
};

@Component({
	components: {
		AppLoading,
	},
})
export default class AppVideo extends Vue {
	@Prop(propRequired(VideoPlayerController))
	player!: VideoPlayerController;
	@Prop(propOptional(Boolean, false)) showLoading!: boolean;
	@Prop(propOptional(Boolean, true)) shouldPlay!: boolean;

	@Prop(propOptional(Function)) initCallback?: (videoTag: HTMLVideoElement) => Promise<boolean>;
	@Prop(propOptional(Boolean, true)) trackPlaytime!: boolean;

	/**
	 * If their browser settings block autoplaying with audio, then the browser
	 * will never autoplay the video since it's not set to be muted. We will try
	 * autoplaying "muted" just to see if that works. We don't want to do that
	 * everywhere, so it's an opt-in behavior through a prop.
	 */
	@Prop(propOptional(Boolean, false)) allowDegradedAutoplay!: boolean;

	isLoaded = false;

	private video!: HTMLVideoElement;
	private videoStartTime = 0;

	mounted() {
		this.video = document.createElement('video');
		this.video.style.display = 'block';
		this.video.style.width = '100%';
		this.video.poster = this.player.poster || '';
		this.video.loop = true;
		this.video.autoplay = this.shouldPlay;
		this.video.muted = this.player.context === 'gif';

		this.setupVideoEvents();

		if (this.player.context !== 'page') {
			this.player.sources.forEach(({ src: url, type }) => {
				const elem = document.createElement('source');
				elem.type = type;
				elem.src = url;
				this.video.appendChild(elem);
			});

			// "play" event will get triggered as soon as it starts playing because
			// of autoplay, or when switching from paused state to playing. We only
			// use it to know if it's loaded in enough to begin the playing, so we
			// can clear it after.
			const onPlay = () => {
				this.isLoaded = true;
				this.video.removeEventListener('play', onPlay);
			};
			this.video.addEventListener('play', onPlay);
		}

		// As soon as we append, it'll actually load into view and start
		// playing.
		this.$el.appendChild(this.video);

		this.endOfInit();
	}

	/**
	 * This is ridiculous, but it's needed. Memory leaks if we don't!
	 * https://dev.w3.org/html5/spec-author-view/video.html#best-practices-for-authors-using-media-elements
	 */
	beforeDestroy() {
		this.trackVideoPlaytime();
		if (this.video) {
			// Empty all sources.
			while (this.video.firstChild) {
				this.video.removeChild(this.video.firstChild);
			}

			this.video.load();
		}
	}

	private async endOfInit() {
		if (this.initCallback) {
			// Wait for the callback to fail or succeed,
			await this.initCallback!(this.video);
		}
		// then syn the states.
		await this.syncStates();
		this.isLoaded = true;
	}

	private async syncStates() {
		this.syncVolume();
		this.syncTime();
		await this.syncPlayState();
	}

	private trackVideoPlaytime() {
		// Gifs currently don't pause when they become 'inactive'.
		if (!this.videoStartTime || this.player.context === 'gif') {
			return;
		}

		const playtime = Date.now() - this.videoStartTime;
		const loops = Math.floor(playtime / this.player.duration);
		trackVideoPlayerEvent(this.player, 'watched', 'playtime', `${Math.ceil(playtime / 1000)}`);
		trackVideoPlayerEvent(this.player, 'watched', 'loops', `${loops}`);
		this.videoStartTime = 0;
	}

	private setupVideoEvents() {
		if (!this.video) {
			return;
		}
		this.video.addEventListener('play', () => {
			this.player.state = 'playing';
			this.videoStartTime = Date.now();
		});
		this.video.addEventListener('pause', () => {
			this.player.state = 'paused';
			this.trackVideoPlaytime();
		});
		this.video.addEventListener('volumechange', () => (this.player.volume = this.video.volume));
		this.video.addEventListener('durationchange', () => {
			if (this.video.duration) {
				this.player.duration = this.video.duration * 1000;
			}
		});
		this.video.addEventListener(
			'timeupdate',
			() => (this.player.currentTime = this.video.currentTime * 1000)
		);
		this.video.addEventListener('progress', () => {
			let time = 0;
			for (let i = 0; i < this.video.buffered.length; ++i) {
				time = Math.max(time, this.video.buffered.end(i) * 1000);
			}
			this.player.bufferedTo = time;
		});
	}

	private async tryPlayingVideo() {
		if (!this.video) {
			return;
		}

		const startVolume = this.player.volume;
		try {
			await this.video.play();
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
			await this.video.play();
			return;
		} catch {}

		// If the autoplaying is still blocked with the volume set to 0,
		// pause the video in the player controller and reset the player
		// volume to the initial setting.
		this.player.state = 'paused';
		this.player.volume = startVolume;
	}

	@Watch('shouldPlay')
	onShouldPlayChange() {
		if (this.shouldPlay) {
			this.tryPlayingVideo();
		} else {
			this.video.pause();
		}
	}

	@Watch('player.volume')
	syncVolume() {
		if (!this.video) {
			return;
		}

		if (this.player.volume !== this.video.volume) {
			this.video.volume = this.player.volume;
		}
	}

	@Watch('player.queuedPlaybackChange')
	async syncPlayState() {
		if (!this.video || this.player.queuedPlaybackChange === null) {
			return;
		}

		if (this.player.queuedPlaybackChange === 'paused' && !this.video.paused) {
			this.video.pause();
		} else if (this.player.queuedPlaybackChange === 'playing' && this.video.paused) {
			await this.tryPlayingVideo();
		}
		this.player.queuedPlaybackChange = null;
		this.player.isLoading = false;
	}

	@Watch('player.queuedTimeChange')
	syncTime() {
		if (!this.video || this.player.queuedTimeChange === null) {
			return;
		}

		const time = this.player.queuedTimeChange;
		this.player.currentTime = time;
		this.player.queuedTimeChange = null;

		// We store in milliseconds, HTMLMediaElement works in seconds.
		this.video.currentTime = time / 1000;
	}
}
