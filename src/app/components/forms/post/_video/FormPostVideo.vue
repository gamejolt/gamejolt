<script lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue';

import { Api, ApiProgressEvent } from '../../../../../_common/api/api.service';
import AppButton from '../../../../../_common/button/AppButton.vue';
import { formatNumber } from '../../../../../_common/filters/number';
import {
	$removeFiresidePostVideo,
	FiresidePostModel,
} from '../../../../../_common/fireside/post/post-model';
import { FiresidePostVideoModel } from '../../../../../_common/fireside/post/video/video-model';
import AppForm, { createForm, FormController } from '../../../../../_common/form-vue/AppForm.vue';
import AppFormControlErrors from '../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormLegend from '../../../../../_common/form-vue/AppFormLegend.vue';
import AppFormControlUpload, {
	AppFormControlUploadInterface,
} from '../../../../../_common/form-vue/controls/upload/AppFormControlUpload.vue';
import { validateFilesize } from '../../../../../_common/form-vue/validators';
import { showErrorGrowl, showSuccessGrowl } from '../../../../../_common/growls/growls.service';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import AppLoadingFade from '../../../../../_common/loading/AppLoadingFade.vue';
import { showModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import { Payload } from '../../../../../_common/payload/payload-service';
import AppProgressBar from '../../../../../_common/progress/AppProgressBar.vue';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../../_common/translate/translate.service';
import AppVideoPlayer from '../../../../../_common/video/player/AppVideoPlayer.vue';
import AppVideoProcessingProgress from '../../../../../_common/video/processing-progress/AppVideoProcessingProgress.vue';

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
</script>

<script lang="ts" setup>
type FormModel = {
	video: File | null;
	_progress: ApiProgressEvent | null;
};

type Props = {
	post: FiresidePostModel;
	wasPublished: boolean;
};

const { post, wasPublished } = defineProps<Props>();

const emit = defineEmits<{
	delete: [];
	'video-status-change': [status: VideoStatus];
	'video-change': [video: FiresidePostVideoModel | null];
}>();

// These fields are populated through the form load.
const maxFilesize = ref(1000);
const maxDuration = ref(60);
const maxAspect = ref(2);
const minAspect = ref(0.5);
const allowedFiletypes = ref<string[]>([]);

const isDropActive = ref(false);
let uploadCancelToken: AbortController | null = null;
const hasVideoProcessingError = ref(false);
const videoProcessingErrorMsg = ref('');

const uploadRef = useTemplateRef<AppFormControlUploadInterface>('upload');

const videos = computed(() => post.videos || []);

const uploadProgress = computed(() => {
	const progressEvent = form.formModel._progress as ProgressEvent | null;
	if (!progressEvent) {
		return 0;
	}
	return progressEvent.loaded / progressEvent.total;
});

const uploadedVideo = computed(() => {
	return videos.value.length ? videos.value[0] : null;
});

const videoManifestSources = computed(() => {
	return uploadedVideo.value?.manifestSources ?? [];
});

const videoMediaItem = computed(() => {
	return uploadedVideo.value?.posterMediaItem;
});

const shouldShowFormPlaceholder = computed(() => {
	return !isLoaded.value && !wasPublished;
});

const allowedFiletypesString = computed(() => {
	return allowedFiletypes.value.map(i => `.${i}`).join(',');
});

const videoStatus = computed(() => {
	if (uploadedVideo.value) {
		if (hasVideoProcessingError.value) {
			return VideoStatus.ERROR;
		}

		if (uploadedVideo.value.is_processing) {
			return VideoStatus.PROCESSING;
		}

		return VideoStatus.COMPLETE;
	}

	if (form.isProcessing) {
		return VideoStatus.UPLOADING;
	}

	return VideoStatus.IDLE;
});

const canRemoveUploadingVideo = computed(() => {
	return !wasPublished && videoStatus.value !== VideoStatus.UPLOADING;
});

const isLoaded = computed(() => form.isLoaded);

watch(videoStatus, () => {
	emit('video-status-change', videoStatus.value);
});

const form: FormController<FormModel> = createForm<FormModel>({
	loadUrl: `/web/posts/manage/add-video/${post.id}`,
	onLoad(payload: any) {
		maxFilesize.value = payload.maxFilesize;
		maxDuration.value = payload.maxDuration;
		maxAspect.value = payload.maxAspect;
		minAspect.value = payload.minAspect;
		allowedFiletypes.value = payload.allowedFiletypes;

		const progress = payload.progress;
		if (progress && progress.status === 'error') {
			hasVideoProcessingError.value = true;
			videoProcessingErrorMsg.value =
				progress.reason ||
				$gettext('We could not process your video for some reason. Try again later.');
		}
	},
	async onSubmit() {
		uploadCancelToken = Api.createCancelToken();
		return Api.sendRequest(
			`/web/posts/manage/add-video/${post.id}`,
			{},
			{
				file: form.formModel.video,
				progress: e => onProgressUpdate(e),
				fileCancelToken: uploadCancelToken.signal,
			}
		);
	},
	onSubmitError(payload: any) {
		// We receive an error when the upload was cancelled, but we do not want
		// to show an error message. It's also useless to cancel the upload
		// again, since it was just cancelled.
		if (!Payload.isCancelledUpload(payload)) {
			showErrorGrowl($gettext('Your video was not submitted successfully.'));
			cancelUpload();
		}
	},
	onSubmitSuccess(payload: any) {
		if (!payload.video) {
			showErrorGrowl($gettext('Your video was not submitted successfully.'));
			cancelUpload();
			return;
		}

		emit('video-change', new FiresidePostVideoModel(payload.video));
	},
});

function videoSelected() {
	if (form.formModel.video !== null) {
		form.submit();
	}
}

function onProgressUpdate(e: ApiProgressEvent | null) {
	if (e) {
		form.formModel._progress = e;
	} else {
		// The event is null when the file is done uploading, discard cancel
		// token now.
		uploadCancelToken = null;
	}
}

function validateDataTransfer(e: DragEvent) {
	return e.dataTransfer && e.dataTransfer.items.length && e.dataTransfer.items[0].kind === 'file';
}

function onDragOver(e: DragEvent) {
	if (!validateDataTransfer(e)) {
		return;
	}
	e.preventDefault();
	isDropActive.value = true;
}

function onDragLeave() {
	isDropActive.value = false;
}

function onDrop(e: DragEvent) {
	if (!validateDataTransfer(e)) {
		return;
	}
	e.preventDefault();
	isDropActive.value = false;
	uploadRef.value?.drop(e);
}

function showSelectVideo() {
	uploadRef.value?.showFileSelect();
}

function onProcessingComplete({ video }: any) {
	if (!video) {
		showErrorGrowl($gettext('The server did not return the processed video.'));
		cancelUpload();
		return;
	}

	showSuccessGrowl({
		title: $gettext('Video uploaded!'),
		message: $gettext('Your video was successfully processed. The post can now be published.'),
		system: true,
	});

	emit('video-change', new FiresidePostVideoModel(video));
}

function onProcessingError(err: string | Error) {
	if (typeof err === 'string') {
		hasVideoProcessingError.value = true;
		videoProcessingErrorMsg.value = err;

		showErrorGrowl($gettext('The server was unable to finish processing your video.'));
		cancelUpload();
	}
	// The only cases where an actual error is emitted is on network error during polling.
	// This does not necessarily mean an actual error during processing, so noop.
}

function cancelUpload() {
	if (uploadCancelToken) {
		uploadCancelToken.abort();
		uploadCancelToken = null;
	}

	form.formModel._progress = null;
	form.formModel.video = null;
}

async function onDeleteUpload() {
	if (videoStatus.value !== VideoStatus.IDLE) {
		const result = await showModalConfirm(
			$gettext(
				`Are you sure you want to remove this video? You'll be able to add another one later.`
			),
			$gettext('Remove video?')
		);

		if (!result) {
			return;
		}
	}

	// We need to tell the backend to remove the video even before saving,
	// because otherwise when you click to add a new video, it'd still think
	// the old video with the error exists - and would report the error
	// status during this form's loadUrl.
	if (videoStatus.value === VideoStatus.ERROR) {
		await $removeFiresidePostVideo(post);
	}

	hasVideoProcessingError.value = false;
	videoProcessingErrorMsg.value = '';

	cancelUpload();
	emit('delete');
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
					:media-item="videoMediaItem!"
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
