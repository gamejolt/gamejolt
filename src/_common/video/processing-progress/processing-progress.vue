<script lang="ts">
import { Emit, Options, Prop, Vue } from 'vue-property-decorator';
import { FiresidePost } from '../../fireside/post/post-model';
import AppImgResponsive from '../../img/AppImgResponsive.vue';
import AppProgressBar from '../../progress/AppProgressBar.vue';
import { AppProgressPoller } from '../../progress/poller/poller';
import AppResponsiveDimensions from '../../responsive-dimensions/AppResponsiveDimensions.vue';

@Options({
	components: {
		AppProgressPoller,
		AppProgressBar,
		AppResponsiveDimensions,
		AppImgResponsive,
	},
})
export default class AppVideoProcessingProgress extends Vue {
	@Prop({ type: Object, required: true }) post!: FiresidePost;

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
	@Emit('error') emitError(_err: string | Error) {}

	onProgress({ videoPosterImgUrl }: any, progress: number, isIndeterminate: boolean) {
		this.hasData = true;
		this.videoPosterImgUrl = videoPosterImgUrl;
		this.isIndeterminate = isIndeterminate;
		this.progress = progress;
	}

	async onError(input: any) {
		if (input instanceof Error) {
			this.emitError(input);
			return;
		}

		const errorMsg =
			input.reason ||
			this.$gettext('We could not process your video for some reason. Try again later.');

		this.emitError(errorMsg);
	}
}
</script>

<template>
	<div>
		<AppProgressPoller
			:url="`/web/posts/manage/add-video-progress/${post.id}`"
			:interval="3000"
			@progress="onProgress"
			@complete="emitComplete"
			@error="onError"
		/>

		<AppResponsiveDimensions :ratio="16 / 9">
			<div v-if="hasData" class="-preview">
				<template v-if="videoPosterImgUrl">
					<AppImgResponsive
						class="-preview-img"
						:src="videoPosterImgUrl"
						:style="{
							filter: cssFilter,
						}"
					/>

					<div class="-preview-icon-container">
						<AppJolticon icon="video" big class="-poster-icon -overlay-icon" />
					</div>
				</template>
				<AppJolticon v-else icon="video" big class="-poster-icon" />
			</div>
		</AppResponsiveDimensions>

		<br />
		<AppProgressBar :percent="progress" :indeterminate="isIndeterminate" thin animate active />

		<div>
			<AppTranslate>
				Your video is currently being processed. This could take some time depending on the
				size of your video.
			</AppTranslate>
			<AppTranslate v-if="post.isActive">
				We will publish your post once it's ready.
			</AppTranslate>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-preview
	change-bg('bg-offset')
	rounded-corners-lg()
	overflow: hidden
	position: relative
	height: 100%
	display: flex
	justify-content: center
	align-items: center

	&-img
		display: block
		position: relative
		max-width: 100%
		max-height: 100%
		transition: filter 0.5s ease

	&-icon-container
		position: absolute
		left: 0
		top: 0
		right: 0
		bottom: 0
		display: flex
		justify-content: center
		align-items: center

.-poster-icon
	filter: drop-shadow(0 0 5px rgba(0, 0, 0, 1))

.-overlay-icon
	color: white
</style>
