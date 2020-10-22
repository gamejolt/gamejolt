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
import { AppImgResponsive } from '../../../../../_common/img/responsive/responsive';
import AppLoadingFade from '../../../../../_common/loading/fade/fade.vue';
import AppProgressBar from '../../../../../_common/progress/bar/bar.vue';
import AppVideoEmbed from '../../../../../_common/video/embed/embed.vue';
import AppVideoPlayer from '../../../../../_common/video/player/player.vue';

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

const enum ProcessingProgressStepName {
	INITIALIZING = 'initializing',
	PROCESSING = 'processing',
	COMPLETE = 'complete',
}

type ProcessingProgress = {
	step: ProcessingProgressStepName;
	stepNum: number;
	totalSteps: number;
	// One of the first things during processing is generating a poster.
	// We can show that poster once it's returned as a preview for the video.
	videoPosterImgUrl: string | null;
};

@Component({
	components: {
		AppLoadingFade,
		AppFormControlUpload,
		AppProgressBar,
		AppFormLegend,
		AppVideoEmbed,
		AppVideoPlayer,
		AppImgResponsive,
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

	videoProvider = FiresidePostVideo.PROVIDER_GAMEJOLT;
	isDropActive = false;
	m_videoStatus = VideoStatus.IDLE;

	/** Current video processing progress returned from backend. */
	processingProgressData: ProcessingProgress = {
		step: ProcessingProgressStepName.INITIALIZING,
		stepNum: 0,
		totalSteps: 100,
		videoPosterImgUrl: null,
	};

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

	get processingProgress() {
		return this.processingProgressData.stepNum / this.processingProgressData.totalSteps;
	}

	get videoStatus() {
		return this.m_videoStatus;
	}

	set videoStatus(value: VideoStatus) {
		this.m_videoStatus = value;
		this.emitVideoStatusChange(value);
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
		return this.videoStatus !== VideoStatus.UPLOADING;
	}

	get processingStepDisplay() {
		switch (this.processingProgressData.step) {
			case ProcessingProgressStepName.INITIALIZING:
				return this.$gettext('Initializing...');
			case ProcessingProgressStepName.PROCESSING:
				return this.$gettext('Processing...');
			case ProcessingProgressStepName.COMPLETE:
				return this.$gettext('Finalizing...');
		}
	}

	get uploadedVideo() {
		const video = this.post.videos[0];
		return video && video.provider !== 'gamejolt' ? video : null;
	}

	get videoManifestUrls() {
		return this.uploadedVideo?.manifestUrls ?? [];
	}

	get videoPoster() {
		return this.uploadedVideo?.posterUrl;
	}

	get videoPosterFilterValue() {
		return (
			`brightness(${0.7 + this.processingProgress * 0.3}) ` +
			`grayscale(${1 - this.processingProgress}) ` +
			`blur(${Math.max(1, 3 - this.processingProgress * 4)}px)`
		);
	}

	get shouldPoll() {
		return (
			this.videoProvider === FiresidePostVideo.PROVIDER_GAMEJOLT &&
			this.videoStatus === VideoStatus.PROCESSING &&
			this.$el.isConnected
		);
	}

	destroyed() {
		// Set this so it stops polling. Don't want to emit anymore though.
		this.m_videoStatus = VideoStatus.IDLE;
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
				// Set to complete for now, we get processing info in onLoad in case the video is still processing.
				this.videoStatus = VideoStatus.COMPLETE;
			}
		}
	}

	onLoad($payload: any) {
		this.maxFilesize = $payload.maxFilesize;
		this.maxDuration = $payload.maxDuration;
		this.maxAspect = $payload.maxAspect;
		this.minAspect = $payload.minAspect;

		// If backend sends progress info, it means the attached uploaded video is being processed.
		if ($payload.progress) {
			this.processingProgressData = $payload.progress;
			this.videoStatus = VideoStatus.PROCESSING;

			// Start polling now.
			this.pollVideoProcessing();
		}
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

	onSubmitError(_$payload: any) {
		Growls.error(this.$gettext('Your video was not submitted successfully.'));
		this.cancelUpload();
	}

	onSubmitSuccess($payload: any) {
		if (!$payload.video) {
			Growls.error(this.$gettext('Your video was not submitted successfully.'));

			this.cancelUpload();
			return;
		}

		this.emitVideoChange(new FiresidePostVideo($payload.video));
		this.videoStatus = VideoStatus.PROCESSING;

		// Once the video file is fully submitted, start polling for processing progress.
		this.pollVideoProcessing();
	}

	videoSelected() {
		if (this.formModel.video !== null) {
			this.$refs.form.submit();
			this.videoStatus = VideoStatus.UPLOADING;
			// Reset the video url here to indicate to the backend that we are now uploading a video.
			this.setField('video_url', '');
		}
	}

	onProgressUpdate(e: ProgressEvent | null) {
		if (e) {
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
		if (!payload.success) {
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
			return;
		}

		if (!this.shouldPoll) {
			this.cancelUpload();
			return;
		}

		if (payload.progress) {
			this.processingProgressData = payload.progress;
			if (this.processingProgressData.videoPosterImgUrl === '') {
				this.processingProgressData.videoPosterImgUrl = null;
			}

			if (this.processingProgressData.step === ProcessingProgressStepName.COMPLETE) {
				// Final progress update must have the result video set.
				if (!payload.video) {
					Growls.error(this.$gettext('The server did not return the processed video.'));
					this.cancelUpload();
					return;
				}

				Growls.success({
					title: this.$gettext('📽 Video uploaded!'),
					message: this.$gettext(
						'Your video was successfully uploaded and processed. The post can now be published.'
					),
					// Send as system notification because the user might tab away from the window
					// since the uploading/processing can take a while.
					system: true,
				});

				this.videoStatus = VideoStatus.COMPLETE;
				this.emitVideoChange(new FiresidePostVideo(payload.video));
				return;
			}
		}

		// Wait 1s after receiving an update to poll for progress again.
		await sleep(1000);

		// Check again if we should still poll after waiting.
		if (!this.shouldPoll) {
			this.cancelUpload();
			return;
		}

		this.pollVideoProcessing();
	}

	cancelUpload() {
		this.setField('_progress', null);
		this.setField('video', null);
		this.videoStatus = VideoStatus.IDLE;
		this.processingProgressData.step = ProcessingProgressStepName.INITIALIZING;
	}

	setVideoProvider(provider: string) {
		this.videoProvider = provider;
		this.emitVideoProviderChange(this.videoProvider);
	}

	@Watch('formModel.video_url')
	onVideoUrlChanged() {
		this.emitVideoUrlChange(this.formModel.video_url);
	}

	onDeleteUpload() {
		this.cancelUpload();
		this.emitDelete();
	}
}
