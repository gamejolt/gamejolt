import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../utils/vue';
import { FiresidePost } from '../../fireside/post/post-model';
import { AppImgResponsive } from '../../img/responsive/responsive';
import AppProgressBar from '../../progress/bar/bar.vue';
import { AppProgressPoller } from '../../progress/poller/poller';
import { AppResponsiveDimensions } from '../../responsive-dimensions/responsive-dimensions';

@Component({
	components: {
		AppProgressPoller,
		AppProgressBar,
		AppResponsiveDimensions,
		AppImgResponsive,
	},
})
export default class AppVideoProcessingProgress extends Vue {
	@Prop(propRequired(FiresidePost)) post!: FiresidePost;

	hasData = false;
	progress = 0;
	isIndeterminate = false;
	// One of the first things during processing is generating a poster.
	// We can show that poster once it's returned as a preview for the video.
	videoPosterImgUrl: null | string = null;

	get cssFilter() {
		// When the video is "done" processing and has no detailed progress,
		// don't have any blur on the image.
		// When we have more detailed progress, we can keep a slight blur since when the video
		// finishes processing, the video player will show instead.
		const blur =
			!this.isIndeterminate && this.progress === 1 ? 0 : Math.max(1, 3 - this.progress * 4);

		return (
			`brightness(${0.7 + this.progress * 0.3}) ` +
			`grayscale(${1 - this.progress}) ` +
			`blur(${blur}px)`
		);
	}

	@Emit('complete') emitComplete(_payload: any) {}
	@Emit('error') emitError(_payload: any) {}

	onProgress({ videoPosterImgUrl }: any, progress: number, isIndeterminate: boolean) {
		this.hasData = true;
		this.videoPosterImgUrl = videoPosterImgUrl;
		this.isIndeterminate = isIndeterminate;
		this.progress = progress;
	}
}
