import Component from 'vue-class-component';
import { Emit, Prop, Watch } from 'vue-property-decorator';
import { sleep } from '../../../../../utils/utils';
import { propRequired } from '../../../../../utils/vue';
import { Api } from '../../../../../_common/api/api.service';
import { number } from '../../../../../_common/filters/number';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { FiresidePostVideo } from '../../../../../_common/fireside/post/video/video-model';
import AppFormControlUploadTS from '../../../../../_common/form-vue/control/upload/upload';
import AppFormControlUpload from '../../../../../_common/form-vue/control/upload/upload.vue';
import AppFormTS from '../../../../../_common/form-vue/form';
import {
	BaseForm,
	FormOnLoad,
	FormOnSubmit,
	FormOnSubmitError,
	FormOnSubmitSuccess,
} from '../../../../../_common/form-vue/form.service';
import AppFormLegend from '../../../../../_common/form-vue/legend/legend.vue';
import AppLoadingFade from '../../../../../_common/loading/fade/fade.vue';
import AppProgressBar from '../../../../../_common/progress/bar/bar.vue';
import AppVideoEmbed from '../../../../../_common/video/embed/embed.vue';

interface FormModel {
	video: File | null;
	video_url: string | null;
	_progress: ProgressEvent | null;
}

const enum ProcessingProgress {
	UNKNOWN = 'unknown',
	COMPLETE = 'complete',
}

@Component({
	components: {
		AppLoadingFade,
		AppFormControlUpload,
		AppProgressBar,
		AppFormLegend,
		AppVideoEmbed,
	},
	filters: {
		number,
	},
})
export default class AppFormPostVideo extends BaseForm<FormModel>
	implements FormOnSubmit, FormOnLoad, FormOnSubmitError, FormOnSubmitSuccess {
	@Prop(propRequired(FiresidePost)) post!: FiresidePost;
	@Prop(propRequired(Boolean)) wasPublished!: boolean;

	readonly YOUTUBE_URL_REGEX = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:&.+)*$/i;

	// These fields are populated through the form load.
	maxFilesize = 1000;
	maxDuration = 60;
	maxAspect = 2;
	minAspect = 0.5;

	videoProvider = FiresidePostVideo.PROVIDER_GAMEJOLT;
	isDropActive = false;
	/** `true` while the video is uploading or processing. */
	isUploadingOrProcessing = false;
	/** Current video processing progress returned from backend. */
	processingProgress = ProcessingProgress.UNKNOWN;

	readonly FiresidePostVideo = FiresidePostVideo;

	$refs!: {
		form: AppFormTS;
		upload: AppFormControlUploadTS;
	};

	@Emit('close')
	emitClose() {}

	@Emit('uploading-change')
	emitUploadingChange(_uploading: boolean) {}

	@Emit('video-upload')
	emitVideoUpload(_video: FiresidePostVideo) {}

	@Emit('video-url-change')
	emitVideoUrlChange(_url: string | null) {}

	get loadUrl() {
		return `/web/posts/manage/add-video/0`;
	}

	get progress() {
		const progressEvent = this.formModel._progress as ProgressEvent | null;
		if (!progressEvent) {
			return 0;
		}

		return progressEvent.loaded / progressEvent.total;
	}

	/** `true` when the file upload is complete (but not the file processing). */
	get uploadComplete() {
		return this.progress === 1;
	}

	get isUploading() {
		return this.isUploadingOrProcessing;
	}

	set isUploading(value: boolean) {
		this.isUploadingOrProcessing = value;
		this.emitUploadingChange(this.isUploadingOrProcessing);
	}

	get hasValidYouTubeUrl() {
		return this.formModel.video_url && this.formModel.video_url.match(this.YOUTUBE_URL_REGEX);
	}

	get youtubeVideoId() {
		const url = this.formModel.video_url;
		if (url) {
			// extract video id from url
			const matches = url.match(this.YOUTUBE_URL_REGEX);
			if (matches && matches.length > 1) {
				const videoId = matches[1];
				return videoId;
			}
		}
	}

	videoSelected() {
		if (this.formModel.video !== null) {
			this.$refs.form.submit();
			this.isUploading = true;
		}
	}

	onLoad($payload: any) {
		this.maxFilesize = $payload.maxFilesize;
		this.maxDuration = $payload.maxDuration;
		this.maxAspect = $payload.maxAspect;
		this.minAspect = $payload.minAspect;
	}

	async onSubmit() {
		return Api.sendRequest(
			`/web/posts/manage/add-video/${this.post.id}`,
			{},
			{
				file: this.formModel.video,
				progress: e => this.onProgressUpdate(e),
			}
		);
	}

	onSubmitError($payload: any) {
		this.cancelUpload();
		// TODO: show error message.
	}

	onSubmitSuccess($payload: any) {
		if (!$payload.video) {
			// TODO: error message for no video.
			this.cancelUpload();
			return;
		}

		// Once the video file is fully submitted, start polling for processing progress.
		this.pollVideoProcessing();
	}

	onProgressUpdate(e: ProgressEvent | null) {
		if (e) {
			console.log(e.loaded, e.total, e.loaded / e.total);
			this.setField('_progress', e);
		}
	}

	private validateDataTransfer(e: DragEvent) {
		return (
			!e.dataTransfer ||
			!e.dataTransfer.items.length ||
			e.dataTransfer.items[0].kind !== 'file' ||
			!e.dataTransfer.items[0].type.includes('video')
		);
	}

	onDragOver(e: DragEvent) {
		// Don't do anything if not a file drop.
		if (!this.validateDataTransfer(e)) {
			return;
		}

		e.preventDefault();
		this.isDropActive = true;
	}

	onDragLeave() {
		this.isDropActive = false;
	}

	// File select resulting from a drop onto the input.
	async onDrop(e: DragEvent) {
		// Don't do anything if not a file drop.
		if (!this.validateDataTransfer(e)) {
			return;
		}

		e.preventDefault();
		this.isDropActive = false;
		this.$refs.upload.drop(e);
	}

	showSelectVideo() {
		this.$refs.upload.showFileSelect();
	}

	async pollVideoProcessing() {
		const payload = await Api.sendRequest(
			`/web/posts/manage/add-video-progress/${this.post.id}`,
			undefined,
			{ detach: true }
		);

		// Falsy success indicates the processing failed.
		// The initial add-video request should return with a form error, so we just stop
		// polling here.
		if (!payload.success || !this.isUploading) {
			console.log('stop polling');
			return;
		}

		if (payload.progress) {
			console.log('progress report', payload.progress);
			this.processingProgress = payload.progress;
			if (this.processingProgress === ProcessingProgress.COMPLETE) {
				this.emitVideoUpload(new FiresidePostVideo(payload.video));
				return;
			}
		}

		// Wait 1s after receiving an update to poll for progress again.
		await sleep(1000);
		this.pollVideoProcessing();
	}

	cancelUpload() {
		this.setField('_progress', null);
		this.setField('video', null);
		this.isUploading = false;
	}

	setVideoProvider(provider: string) {
		this.videoProvider = provider;
	}

	@Watch('formModel.video_url')
	onVideoUrlChanged() {
		this.emitVideoUrlChange(this.formModel.video_url);
	}
}
