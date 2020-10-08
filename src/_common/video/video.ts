import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../utils/vue';
import AppLoading from '../loading/loading.vue';

// We have to not use Vue for video embed stuff!
// https://forum.ionicframework.com/t/ionic-2-video-video-memory-leak-garbage-collection-solved/52333
// Massive memory leaks if we don't keep this out of Vue and finely tuned.

@Component({
	components: {
		AppLoading,
	},
})
export default class AppVideo extends Vue {
	@Prop(propRequired(String)) poster!: string;
	@Prop(propRequired(String)) webm!: string;
	@Prop(propRequired(String)) mp4!: string;
	@Prop(propOptional(Boolean, false)) showLoading!: boolean;
	@Prop(propOptional(Boolean, true)) shouldPlay!: boolean;

	isLoaded = false;

	private video!: HTMLVideoElement;

	@Watch('shouldPlay')
	onShouldPlayChange() {
		if (this.shouldPlay) {
			this.video.play();
		} else {
			this.video.pause();
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
		const onPlay = () => {
			this.isLoaded = true;
			this.video.removeEventListener('play', onPlay);
		};
		this.video.addEventListener('play', onPlay);

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
