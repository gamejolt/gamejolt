import { CancelTokenSource } from 'axios';
import Component from 'vue-class-component';
import { Emit, Prop, Watch } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { Api } from '../../../../../_common/api/api.service';
import { number } from '../../../../../_common/filters/number';
import { FiresidePost } from '../../../../../_common/fireside/post/post-model';
import { FiresidePostVideo } from '../../../../../_common/fireside/post/video/video-model';
import AppFormControlUploadTS from '../../../../../_common/form-vue/control/upload/upload';
import AppFormControlUpload from '../../../../../_common/form-vue/control/upload/upload.vue';
import { AppFocusWhen } from '../../../../../_common/form-vue/focus-when.directive';
import AppFormTS from '../../../../../_common/form-vue/form';
import {
	BaseForm,
	FormOnInit,
	FormOnLoad,
	FormOnSubmit,
	FormOnSubmitError,
	FormOnSubmitSuccess,
} from '../../../../../_common/form-vue/form.service';
import AppFormLegend from '../../../../../_common/form-vue/legend/legend.vue';
import { Growls } from '../../../../../_common/growls/growls.service';
import AppLoadingFade from '../../../../../_common/loading/fade/fade.vue';
import { ModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import { Payload } from '../../../../../_common/payload/payload-service';
import AppProgressBar from '../../../../../_common/progress/bar/bar.vue';
import AppVideoEmbed from '../../../../../_common/video/embed/embed.vue';
import AppVideoPlayer from '../../../../../_common/video/player/player.vue';
import AppVideoProcessingProgress from '../../../../../_common/video/processing-progress/processing-progress.vue';

interface FormModel {
	video: File | null;
	video_url: string;
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

@Component({
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
export default class AppFormPostVideo extends BaseForm<FormModel>
	implements FormOnSubmit, FormOnLoad, FormOnSubmitError, FormOnSubmitSuccess, FormOnInit {
	@Prop(propRequired(FiresidePost)) post!: FiresidePost;
	@Prop(propRequired(Boolean)) wasPublished!: boolean;

	readonly YOUTUBE_URL_REGEX = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:&.+)*$/i;

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
	readonly number = number;

	$refs!: {
		form: AppFormTS;
		upload: AppFormControlUploadTS;
	};

	@Emit('delete')
	emitDelete() {}

	@Emit('video-status-change')
	emitVideoStatusChange(_status: VideoStatus) {}

	@Emit('video-change')
	emitVideoChange(_video: FiresidePostVideo | null) {}

	@Emit('video-url-change')
	emitVideoUrlChange(_url: string) {}

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

		if (this.state.isProcessing) {
			return VideoStatus.UPLOADING;
		}

		return VideoStatus.IDLE;
	}

	@Watch('videoStatus')
	onVideoStatusChange() {
		this.emitVideoStatusChange(this.videoStatus);
	}

	onInit() {
		// Set the video_url field based on the input post.
		// This is important when opening this form for editing.
		if (this.post.videos.length) {
			const video = this.post.videos[0];
			if (video.provider === FiresidePostVideo.PROVIDER_YOUTUBE) {
				this.setField(
					'video_url',
					'https://www.youtube.com/watch?v=' + this.post.videos[0].video_id
				);
				this.setVideoProvider(FiresidePostVideo.PROVIDER_YOUTUBE);
			} else if (video.provider === FiresidePostVideo.PROVIDER_GAMEJOLT) {
				this.setField('video_url', '');
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
			Growls.error(this.$gettext('Your video was not submitted successfully.'));
			this.cancelUpload();
		}
	}

	onSubmitSuccess($payload: any) {
		if (!$payload.video) {
			Growls.error(this.$gettext('Your video was not submitted successfully.'));

			this.cancelUpload();
			return;
		}

		this.emitVideoChange(new FiresidePostVideo($payload.video));
	}

	videoSelected() {
		if (this.formModel.video !== null) {
			this.$refs.form.submit();

			// Reset the video url here to indicate to the backend that we are
			// now uploading a video.
			this.setField('video_url', '');
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
			Growls.error(this.$gettext('The server did not return the processed video.'));
			this.cancelUpload();
			return;
		}

		Growls.success({
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
			Growls.error(
				this.$gettextInterpolate(
					'The server was unable to finish processing your video. Status: %{ reason }',
					{ reason: (payload.reason as string).toUpperCase().replace('-', '_') }
				)
			);
		} else {
			Growls.error(
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

	@Watch('formModel.video_url')
	onVideoUrlChanged() {
		this.emitVideoUrlChange(this.formModel.video_url);
	}

	async onDeleteUpload() {
		if (this.videoStatus !== VideoStatus.IDLE) {
			const result = await ModalConfirm.show(
				this.$gettext(
					'When you remove your video, you can upload a new one later or link a YouTube video instead.'
				),
				this.$gettext('Remove uploaded video?'),
				'yes'
			);

			if (!result) {
				return;
			}
		}

		this.cancelUpload();
		this.emitDelete();
	}
}
