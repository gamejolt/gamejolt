<script lang="ts">
import { Emit, mixins, Options, Prop, Watch } from 'vue-property-decorator';
import { Api, ApiProgressEvent } from '../../../../../_common/api/api.service';
import { formatNumber } from '../../../../../_common/filters/number';
import { FiresidePostModel } from '../../../../../_common/fireside/post/post-model';
import { FiresidePostVideoModel } from '../../../../../_common/fireside/post/video/video-model';
import AppFormLegend from '../../../../../_common/form-vue/AppFormLegend.vue';
import AppFormControlUpload, {
	AppFormControlUploadInterface,
} from '../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import { vAppFocusWhen } from '../../../../../_common/form-vue/focus-when.directive';
import {
	BaseForm,
	FormOnLoad,
	FormOnSubmit,
	FormOnSubmitError,
	FormOnSubmitSuccess,
} from '../../../../../_common/form-vue/form.service';
import { showErrorGrowl, showSuccessGrowl } from '../../../../../_common/growls/growls.service';
import AppLoadingFade from '../../../../../_common/loading/AppLoadingFade.vue';
import { showModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import { Payload } from '../../../../../_common/payload/payload-service';
import AppProgressBar from '../../../../../_common/progress/AppProgressBar.vue';
import AppVideoEmbed from '../../../../../_common/video/embed/AppVideoEmbed.vue';
import AppVideoPlayer from '../../../../../_common/video/player/AppVideoPlayer.vue';
import AppVideoProcessingProgress from '../../../../../_common/video/processing-progress/AppVideoProcessingProgress.vue';

interface FormModel {
	video: File | null;
	_progress: ApiProgressEvent | null;
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
	/** The video upload encountered some error */
	ERROR = 'error',
}

class Wrapper extends BaseForm<FormModel> {}

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
		AppFocusWhen: vAppFocusWhen,
	},
})
export default class AppFormPostVideo
	extends mixins(Wrapper)
	implements FormOnSubmit, FormOnLoad, FormOnSubmitError, FormOnSubmitSuccess
{
	@Prop({ type: Object }) post!: FiresidePostModel;
	@Prop({ type: Boolean, required: true }) wasPublished!: boolean;

	// These fields are populated through the form load.
	maxFilesize = 1000;
	maxDuration = 60;
	maxAspect = 2;
	minAspect = 0.5;
	allowedFiletypes: string[] = [];

	isDropActive = false;
	uploadCancelToken: AbortController | null = null;
	hasVideoProcessingError = false;
	videoProcessingErrorMsg = '';

	readonly FiresidePostVideo = FiresidePostVideoModel;
	readonly formatNumber = formatNumber;

	declare $refs: {
		upload: AppFormControlUploadInterface;
	};

	@Emit('delete')
	emitDelete() {}

	@Emit('video-status-change')
	emitVideoStatusChange(_status: VideoStatus) {}

	@Emit('video-change')
	emitVideoChange(_video: FiresidePostVideoModel | null) {}

	get loadUrl() {
		return `/web/posts/manage/add-video/${this.post.id}`;
	}

	get videos() {
		return this.post.videos || [];
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
		return this.videos.length ? this.videos[0] : null;
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
			if (this.hasVideoProcessingError) {
				return VideoStatus.ERROR;
			}

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

	onLoad($payload: any) {
		this.maxFilesize = $payload.maxFilesize;
		this.maxDuration = $payload.maxDuration;
		this.maxAspect = $payload.maxAspect;
		this.minAspect = $payload.minAspect;
		this.allowedFiletypes = $payload.allowedFiletypes;

		const progress = $payload.progress;
		if (progress && progress.status === 'error') {
			this.hasVideoProcessingError = true;
			this.videoProcessingErrorMsg =
				progress.reason ||
				this.$gettext('We could not process your video for some reason. Try again later.');
		}
	}

	async onSubmit() {
		this.uploadCancelToken = Api.createCancelToken();
		return Api.sendRequest(
			`/web/posts/manage/add-video/${this.post.id}`,
			{},
			{
				file: this.formModel.video,
				progress: e => this.onProgressUpdate(e),
				fileCancelToken: this.uploadCancelToken.signal,
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

		this.emitVideoChange(new FiresidePostVideoModel($payload.video));
	}

	videoSelected() {
		if (this.formModel.video !== null) {
			this.form.submit();
		}
	}

	onProgressUpdate(e: ApiProgressEvent | null) {
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
		this.$refs.upload?.drop(e);
	}

	showSelectVideo() {
		this.$refs.upload?.showFileSelect();
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

		this.emitVideoChange(new FiresidePostVideoModel(video));
	}

	onProcessingError(err: string | Error) {
		if (typeof err === 'string') {
			this.hasVideoProcessingError = true;
			this.videoProcessingErrorMsg = err;

			showErrorGrowl(this.$gettext('The server was unable to finish processing your video.'));
			this.cancelUpload();
		} else {
			// The only cases where an actual error is emitted is on network error during polling.
			// This does not necessarily mean an actual error during processing, so noop.
		}
	}

	cancelUpload() {
		// Cancel the file upload now.
		if (this.uploadCancelToken) {
			this.uploadCancelToken.abort();
			this.uploadCancelToken = null;
		}

		this.setField('_progress', null);
		this.setField('video', null);
	}

	async onDeleteUpload() {
		if (this.videoStatus !== VideoStatus.IDLE) {
			const result = await showModalConfirm(
				this.$gettext(
					`Are you sure you want to remove this video? You'll be able to add another one later.`
				),
				this.$gettext('Remove video?')
			);

			if (!result) {
				return;
			}
		}

		// We need to tell the backend to remove the video even before saving,
		// because otherwise when you click to add a new video, it'd still think
		// the old video with the error exists - and would report the error
		// status during this form's loadUrl.
		//
		// Normally we don't want to apply changes until the form is saved but
		// in this case specifically I think it makes sense since the video is
		// unpublishable anyways.
		if (this.videoStatus === VideoStatus.ERROR) {
			await this.post.$removeVideo();
		}

		this.hasVideoProcessingError = false;
		this.videoProcessingErrorMsg = '';

		this.cancelUpload();
		this.emitDelete();
	}
}
</script>

<template>
	<AppLoadingFade :is-loading="!isLoaded">
		<template v-if="shouldShowFormPlaceholder">
			<AppFormLegend compact :deletable="canRemoveUploadingVideo">
				<span class="-placeholder-text" style="width: 60px" />
			</AppFormLegend>
			<p class="help-block">
				<span class="-placeholder-text" style="width: 230px" />
				<br />
				<span class="-placeholder-text" style="width: 310px" />
				<br />
				<span class="-placeholder-text" style="width: 190px" />
			</p>
			<span class="-placeholder-add" />
		</template>
		<template v-else>
			<AppFormLegend compact :deletable="canRemoveUploadingVideo" @delete="onDeleteUpload">
				<AppTranslate>Video</AppTranslate>
			</AppFormLegend>

			<template v-if="videoStatus === 'idle'">
				<AppForm :controller="form">
					<AppFormGroup
						name="video"
						class="sans-margin-bottom"
						hide-label
						optional
						:label="$gettext(`Video`)"
					>
						<p class="help-block">
							<AppTranslate>
								Your video must be between 1 second and 30 minutes long.
							</AppTranslate>
							<br />
							<AppTranslate>Videos must be bigger than 200x200.</AppTranslate>
							<AppTranslate>Video filetypes currently supported:</AppTranslate>
							<span
								v-for="filetype of allowedFiletypes"
								:key="filetype"
								style="margin-right: 2px"
							>
								<code>{{ filetype }}</code>
							</span>
						</p>

						<div
							@dragover="onDragOver($event)"
							@dragleave="onDragLeave()"
							@drop="onDrop($event)"
						>
							<a
								class="-add"
								:class="{
									'-drop-active': isDropActive,
								}"
								@click="showSelectVideo()"
							>
								<div class="-add-inner">
									<div>
										<AppJolticon icon="add" big />
										<br />
										<b>
											<AppTranslate>Video</AppTranslate>
										</b>
									</div>
								</div>
							</a>
						</div>

						<AppFormControlUpload
							ref="upload"
							class="-upload-input"
							:validators="[validateFilesize(maxFilesize)]"
							:accept="allowedFiletypesString"
							@changed="videoSelected()"
						/>

						<AppFormControlErrors />
					</AppFormGroup>
				</AppForm>
			</template>
			<template v-else-if="videoStatus === 'uploading'">
				<AppProgressBar :percent="uploadProgress * 100" />

				<AppTranslate>Uploading...</AppTranslate>
				{{ formatNumber(uploadProgress, { style: 'percent' }) }}

				<AppButton
					class="pull-right"
					trans
					:disabled="uploadProgress === 1"
					@click="cancelUpload"
				>
					<AppTranslate>Cancel Upload</AppTranslate>
				</AppButton>
			</template>
			<template v-else-if="videoStatus === 'processing'">
				<AppVideoProcessingProgress
					:post="post"
					@complete="onProcessingComplete"
					@error="onProcessingError"
				/>
			</template>
			<template v-else-if="videoStatus === 'error'">
				<div class="alert alert-notice">{{ videoProcessingErrorMsg }}</div>
			</template>
			<template v-else-if="videoStatus === 'complete'">
				<AppVideoPlayer
					class="-video-player"
					context="feed"
					:media-item="videoMediaItem"
					:manifests="videoManifestSources"
				/>
			</template>
		</template>
	</AppLoadingFade>
</template>

<style lang="stylus" scoped>
@import '../_media/variables'

.-placeholder-text
	lazy-placeholder-inline()

.-placeholder-add
	lazy-placeholder-block()
	width: $-height + $border-width-large
	height: $-height + $border-width-large

.-add
	rounded-corners-lg()
	theme-prop('border-color', 'bg-subtle')
	display: inline-block
	vertical-align: top
	text-align: center
	border-width: $border-width-large
	border-style: dashed
	margin-right: $-padding
	transition: border-color 0.1s ease

	&:hover
	&.-drop-active
		theme-prop('border-color', 'link')
		theme-prop('color', 'link')

	&.-drop-active
		border-style: solid

.-add-inner
	display: flex
	align-items: center
	justify-content: center
	width: $-height
	height: $-height

.-upload-input
	display: none

.-video-embed
	rounded-corners-lg()
	overflow: hidden
</style>
