import Component from 'vue-class-component';
import { Emit, Prop } from 'vue-property-decorator';
import { sleep } from '../../../../../utils/utils';
import { propRequired } from '../../../../../utils/vue';
import { Api } from '../../../../../_common/api/api.service';
import { number } from '../../../../../_common/filters/number';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
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

interface FormModel {
	video: File | null;
	_progress: ProgressEvent | null;
}

const enum ProcessingProgress {
	UNKNOWN = 'unknown',
}

@Component({
	components: {
		AppLoadingFade,
		AppFormControlUpload,
		AppProgressBar,
		AppFormLegend,
	},
	filters: {
		number,
	},
})
export default class AppFormPostVideo extends BaseForm<FormModel>
	implements FormOnSubmit, FormOnLoad, FormOnSubmitError, FormOnSubmitSuccess {
	@Prop(propRequired(FiresidePost)) post!: FiresidePost;

	maxFilesize = 1000;
	maxDuration = 60;
	maxAspect = 2;
	minAspect = 0.5;

	isDropActive = false;
	/** `true` while the video is uploading or processing. */
	isUploadingOrProcessing = false;
	/** Current video processing progress returned from backend. */
	processingProgress = ProcessingProgress.UNKNOWN;

	$refs!: {
		form: AppFormTS;
		upload: AppFormControlUploadTS;
	};

	@Emit('close')
	emitClose() {}

	@Emit('uploading-change')
	emitUploadingChange(_uploading: boolean) {}

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
		// TODO: the payload will include the fireside post video which we can then emit.
		// That will disable this form and instead show a video preview in the post form.
		this.isUploading = false;
	}

	onProgressUpdate(e: ProgressEvent | null) {
		if (e) {
			console.log(e.loaded, e.total, e.loaded / e.total);
			this.setField('_progress', e);

			// After the file is uploaded, start polling for processing updates.
			if (this.uploadComplete) {
				this.pollVideoProcessing();
			}
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
		if (!payload.success) {
			console.log('stop polling');
			return;
		}

		if (payload.progress) {
			this.processingProgress = payload.progress;
		}

		// Wait 1s after receiving an update to poll for progress again.
		await sleep(1000);
		this.pollVideoProcessing();
	}

	onDisableVideo() {
		this.emitClose();
	}

	cancelUpload() {
		this.setField('_progress', null);
		this.setField('video', null);
		this.isUploading = false;
	}
}
