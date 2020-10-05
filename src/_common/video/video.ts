import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../utils/vue';
import AppLoading from '../loading/loading.vue';
import {
	PlayerController,
	setPlayerControllerDuration,
	setPlayerControllerTimestamp,
	setPlayerControllerVideo,
} from '../player/controller';
import AppVideoPlayer from './player/player.vue';

// We have to not use Vue for video embed stuff!
// https://forum.ionicframework.com/t/ionic-2-video-video-memory-leak-garbage-collection-solved/52333
// Massive memory leaks if we don't keep this out of Vue and finely tuned.

// Sync up with the scrubber transition-right timing in the scrubber.vue styling
const SCRUBBER_REFRESH_RATE = 250;

@Component({
	components: {
		AppLoading,
		AppVideoPlayer,
	},
})
export default class AppVideo extends Vue {
	@Prop(propRequired(String)) poster!: string;
	@Prop(propRequired(String)) webm!: string;
	@Prop(propRequired(String)) mp4!: string;
	@Prop(propOptional(Boolean, false)) showLoading!: boolean;
	@Prop(propOptional(Boolean, true)) shouldPlay!: boolean;
	@Prop(propOptional(Boolean, false)) disableControls!: boolean;

	isLoaded = false;

	private timer?: NodeJS.Timer;
	private video!: HTMLVideoElement;
	player = new PlayerController();

	@Watch('shouldPlay')
	onShouldPlayChange() {
		if (this.shouldPlay && (!this.isLoaded || this.player.shouldPlay)) {
			// only make the video play when we're initializing or if it was already playing previously.
			this.video.play();
		} else {
			this.video.pause();
		}
	}

	private setWatcher() {
		this.timer = setInterval(() => {
			if (this.video.ended) {
				setPlayerControllerTimestamp(this.player, this.video.duration);
				this.clearWatcher();
			} else if (this.shouldPlay && this.player.shouldPlay) {
				setPlayerControllerTimestamp(this.player, this.video.currentTime);
				setPlayerControllerDuration(this.player, this.video.duration);
			}
		}, SCRUBBER_REFRESH_RATE);
	}

	private clearWatcher() {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = undefined;
		}
	}

	mounted() {
		// We have to recreate this in the template for SSR-only.
		const webm = document.createElement('source');
		webm.type = 'video/webm';
		webm.src = this.webm;

		const mp4 = document.createElement('source');
		mp4.type = 'video/mp4';
		mp4.src = this.mp4;

		this.video = document.createElement('video');
		this.video.style.display = 'block';
		this.video.style.width = '100%';
		this.video.poster = this.poster;
		this.video.loop = true;
		this.video.autoplay = this.shouldPlay;
		this.video.muted = true;
		this.video.appendChild(webm);
		this.video.appendChild(mp4);

		// "play" event will get triggered as soon as it starts playing because
		// of autoplay, or when switching from paused state to playing. We only
		// use it to know if it's loaded in enough to begin the playing, so we
		// can clear it after.
		const onPlay = async () => {
			this.clearWatcher();
			this.isLoaded = true;

			await this.$nextTick();

			this.player.shouldPlay = true; // JODO: better management for autoplaying
			this.setWatcher();
			this.video.removeEventListener('play', onPlay);
		};
		this.video.addEventListener('play', onPlay);

		setPlayerControllerVideo(this.player, this.video);

		// As soon as we append, it'll actually load into view and start
		// playing.
		this.$el.appendChild(this.video);
	}

	/**
	 * This is ridiculous, but it's needed. Memory leaks if we don't!
	 * https://dev.w3.org/html5/spec-author-view/video.html#best-practices-for-authors-using-media-elements
	 */
	beforeDestroy() {
		if (this.video) {
			// Empty all sources.
			while (this.video.firstChild) {
				this.video.removeChild(this.video.firstChild);
			}

			this.video.load();
		}
	}
}
