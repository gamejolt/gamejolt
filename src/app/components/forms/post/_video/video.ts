import { CancelTokenSource } from 'axios';
import { Emit, Options, Prop, Watch } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { Api } from '../../../../../_common/api/api.service';
import { formatNumber } from '../../../../../_common/filters/number';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { FiresidePostVideo } from '../../../../../_common/fireside/post/video/video-model';
import AppFormLegend from '../../../../../_common/form-vue/AppFormLegend.vue';
import AppFormControlUpload from '../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import AppFormControlUploadTS from '../../../../../_common/form-vue/controls/upload/upload';
import { AppFocusWhen } from '../../../../../_common/form-vue/focus-when.directive';
import {
	BaseForm,
	FormOnLoad,
	FormOnSubmit,
	FormOnSubmitError,
	FormOnSubmitSuccess,
} from '../../../../../_common/form-vue/form.service';
import { showErrorGrowl, showSuccessGrowl } from '../../../../../_common/growls/growls.service';
import AppLoadingFade from '../../../../../_common/loading/AppLoadingFade.vue';
import { ModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import { Payload } from '../../../../../_common/payload/payload-service';
import AppProgressBar from '../../../../../_common/progress/bar/bar.vue';
import AppVideoEmbed from '../../../../../_common/video/embed/embed.vue';
import AppVideoPlayer from '../../../../../_common/video/player/player.vue';
import AppVideoProcessingProgress from '../../../../../_common/video/processing-progress/processing-progress.vue';

interface FormModel {
	video: File | null;
	_progress: ProgressEvent | null;
}

export const enum VideoStatus {
	/** No video is being uploaded */
	IDLE = 'idle',
	/** The video file is being uploaded to the Game Jolt server */
	UPLOADING = 'uploading',
	/** The uploaded video file is being processed */
	PROCESSING = 'processing',
	/** The video upload and processing is completed and the video can be viewed */
	COMPLETE = 'complete',
}

@Options({
	components: {
		AppLoadingFade,
		AppFormControlUpload,
		AppProgressBar,
		AppFormLegend,
		AppVideoEmbed,
		AppVideoPlayer,
		AppVideoProcessingProgress,
	},
	directives: {
		AppFocusWhen,
	},
})
export default class AppFormPostVideo
	extends BaseForm<FormModel>
	implements FormOnSubmit, FormOnLoad, FormOnSubmitError, FormOnSubmitSuccess
{
	@Prop(propRequired(FiresidePost)) post!: FiresidePost;
	@Prop(propRequired(Boolean)) wasPublished!: boolean;

	// These fields are populated through the form load.
	maxFilesize = 1000;
	maxDuration = 60;
	maxAspect = 2;
	minAspect = 0.5;
	allowedFiletypes: string[] = [];

	videoProvider = FiresidePostVideo.PROVIDER_GAMEJOLT;
	isDropActive = false;
	uploadCancelToken: CancelTokenSource | null = null;

	readonly FiresidePostVideo = FiresidePostVideo;
	readonly formatNumber = formatNumber;

	declare $refs: {
		upload: AppFormControlUploadTS;
	};

	@Emit('delete')
	emitDelete() {}

	@Emit('video-status-change')
	emitVideoStatusChange(_status: VideoStatus) {}

	@Emit('video-change')
	emitVideoChange(_video: FiresidePostVideo | null) {}

	@Emit('video-provider-change')
	emitVideoProviderChange(_provider: string) {}

	get loadUrl() {
		return `/web/posts/manage/add-video/${this.post.id}`;
	}

	get uploadProgress() {
		const progressEvent = this.formModel._progress as ProgressEvent | null;
		if (!progressEvent) {
			return 0;
		}

		return progressEvent.loaded / progressEvent.total;
	}

	get canRemoveUploadingVideo() {
		return !this.wasPublished && this.videoStatus !== VideoStatus.UPLOADING;
	}

	get uploadedVideo() {
		const video = this.post.videos[0];
		return video && video.provider === FiresidePostVideo.PROVIDER_GAMEJOLT ? video : null;
	}

	get videoManifestSources() {
		return this.uploadedVideo?.manifestSources ?? [];
	}

	get videoMediaItem() {
		return this.uploadedVideo?.posterMediaItem;
	}

	get shouldShowFormPlaceholder() {
		return !this.isLoaded && !this.wasPublished;
	}

	get allowedFiletypesString() {
		return this.allowedFiletypes.map(i => `.${i}`).join(',');
	}

	get videoStatus() {
		if (this.uploadedVideo) {
			if (this.uploadedVideo.is_processing) {
				return VideoStatus.PROCESSING;
			}
			return VideoStatus.COMPLETE;
		}

		if (this.form.isProcessing) {
			return VideoStatus.UPLOADING;
		}

		return VideoStatus.IDLE;
	}

	@Watch('videoStatus')
	onVideoStatusChange() {
		this.emitVideoStatusChange(this.videoStatus);
	}

	onInit() {
		if (this.post.videos.length) {
			const video = this.post.videos[0];
			if (video.provider === FiresidePostVideo.PROVIDER_GAMEJOLT) {
				this.setVideoProvider(FiresidePostVideo.PROVIDER_GAMEJOLT);
			}
		} else {
			this.setVideoProvider(FiresidePostVideo.PROVIDER_GAMEJOLT);
		}
	}

	onLoad($payload: any) {
		this.maxFilesize = $payload.maxFilesize;
		this.maxDuration = $payload.maxDuration;
		this.maxAspect = $payload.maxAspect;
		this.minAspect = $payload.minAspect;
		this.allowedFiletypes = $payload.allowedFiletypes;
	}

	async onSubmit() {
		this.uploadCancelToken = Api.createCancelToken();
		return Api.sendRequest(
			`/web/posts/manage/add-video/${this.post.id}`,
			{},
			{
				file: this.formModel.video,
				progress: e => this.onProgressUpdate(e),
				fileCancelToken: this.uploadCancelToken,
			}
		);
	}

	onSubmitError($payload: any) {
		// We receive an error when the upload was cancelled, but we do not want
		// to show an error message. It's also useless to cancel the upload
		// again, since it was just cancelled.
		if (!Payload.isCancelledUpload($payload)) {
			showErrorGrowl(this.$gettext('Your video was not submitted successfully.'));
			this.cancelUpload();
		}
	}

	onSubmitSuccess($payload: any) {
		if (!$payload.video) {
			showErrorGrowl(this.$gettext('Your video was not submitted successfully.'));

			this.cancelUpload();
			return;
		}

		this.emitVideoChange(new FiresidePostVideo($payload.video));
	}

	videoSelected() {
		if (this.formModel.video !== null) {
			this.form.submit();
		}
	}

	onProgressUpdate(e: ProgressEvent | null) {
		if (e) {
			this.setField('_progress', e);
		} else {
			// The event is null when the file is done uploading, discard cancel
			// token now.
			this.uploadCancelToken = null;
		}
	}

	private validateDataTransfer(e: DragEvent) {
		return (
			e.dataTransfer && e.dataTransfer.items.length && e.dataTransfer.items[0].kind === 'file'
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
	onDrop(e: DragEvent) {
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

	onProcessingComplete({ video }: any) {
		// Final progress update must have the result video set.
		if (!video) {
			showErrorGrowl(this.$gettext('The server did not return the processed video.'));
			this.cancelUpload();
			return;
		}

		showSuccessGrowl({
			title: this.$gettext('📽 Video uploaded!'),
			message: this.$gettext(
				'Your video was successfully processed. The post can now be published.'
			),
			// Send as system notification because the user might tab away from the window
			// since the uploading/processing can take a while.
			system: true,
		});

		this.emitVideoChange(new FiresidePostVideo(video));
	}

	onProcessingError(payload: any) {
		if (payload.reason) {
			showErrorGrowl(
				this.$gettextInterpolate(
					'The server was unable to finish processing your video. Status: %{ reason }',
					{ reason: (payload.reason as string).toUpperCase().replace('-', '_') }
				)
			);
		} else {
			showErrorGrowl(
				this.$gettext(
					'The server was unable to finish processing your video. Status: GENERIC_FAILURE'
				)
			);
		}

		this.cancelUpload();
	}

	cancelUpload() {
		// Cancel the file upload now.
		if (this.uploadCancelToken) {
			this.uploadCancelToken.cancel();
			this.uploadCancelToken = null;
		}

		this.setField('_progress', null);
		this.setField('video', null);
	}

	setVideoProvider(provider: string) {
		this.videoProvider = provider;
		this.emitVideoProviderChange(this.videoProvider);
	}

	async onDeleteUpload() {
		if (this.videoStatus !== VideoStatus.IDLE) {
			const result = await ModalConfirm.show(
				this.$gettext(
					`Are you sure you want to remove this video? You'll be able to add another one later.`
				),
				this.$gettext('Remove video?')
			);

			if (!result) {
				return;
			}
		}

		this.cancelUpload();
		this.emitDelete();
	}
}
