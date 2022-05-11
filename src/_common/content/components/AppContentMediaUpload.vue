<script lang="ts" setup>
import { EditorView } from 'prosemirror-view';
import { computed, onMounted, PropType } from 'vue';
import { Api } from '../../api/api.service';
import { showErrorGrowl } from '../../growls/growls.service';
import AppLoading from '../../loading/loading.vue';
import { MediaItem } from '../../media-item/media-item-model';
import AppProgressBar from '../../progress/AppProgressBar.vue';
import { $gettext } from '../../translate/translate.service';
import { getMediaItemTypeForContext } from '../content-context';
import {
	editorMediaUploadCancel,
	editorMediaUploadFinalize,
} from '../content-editor/content-editor-controller';
import { ContentEditorService } from '../content-editor/content-editor.service';
import { ContentEditorSchema } from '../content-editor/schemas/content-editor-schema';
import { useContentOwnerController } from '../content-owner';

const props = defineProps({
	uploadId: {
		type: String,
		required: true,
	},
	editorView: {
		type: Object as PropType<EditorView<ContentEditorSchema>>,
		required: true,
	},
});

const owner = useContentOwnerController()!;
const task = ContentEditorService.UploadTaskCache[props.uploadId]!;

const placeholderMaxHeight = computed(() => {
	const maxHeight = owner.contentRules.maxMediaHeight;
	if (maxHeight !== null) {
		return maxHeight;
	}
	return 260;
});

onMounted(() => {
	// In the app, we don't handle the upload. The app will do it all.
	if (!GJ_IS_DESKTOP_APP) {
		_uploadFile();
	}
});

async function _uploadFile() {
	let file = task.file!;

	// Non-alphanumeric chars get removed.
	let name = (file.name || 'pasted_image').replace(/ /g, '_').replace(/\.[^/.]+$/, '');
	const chars = name.split('').filter(i => /[a-z0-9_-]/i.test(i));
	if (chars.length === 0) {
		name = 'image';
	} else {
		name = chars.join('');
	}

	// Rename file by copying data into a new file object.
	const blob = file.slice(0, file.size, file.type);
	file = new File([blob], name, { type: file.type });

	// Start uploading media item
	try {
		const mediaItem = await _doUpload(file);
		if (mediaItem instanceof MediaItem) {
			editorMediaUploadFinalize(task, mediaItem);
		}
	} catch (error) {
		editorMediaUploadCancel(task);

		showErrorGrowl({
			title: $gettext('Oh no!'),
			message: $gettext('Something went wrong while uploading your image.'),
		});
	}
}

async function _doUpload(file: File) {
	task.progress = 0;
	task.isProcessing = false;

	const itemType = getMediaItemTypeForContext(owner.context);
	const parentId = await owner.getModelId?.();
	const payload = await Api.sendRequest(
		'/web/dash/media-items/add-one',
		{
			type: itemType,
			parent_id: parentId,
		},
		{
			file,
			progress: _handleProgressEvent,
			detach: true,
		}
	);

	if (!payload.success || !payload.mediaItem) {
		throw new Error('Failed to upload file.');
	}

	return new MediaItem(payload.mediaItem);

	// TODO: We should be getting this info before instead of showing after the failure.

	//  else if (!payload.success && payload.errors.file) {
	// 	const sizePayload = await Api.sendRequest('/web/dash/media-items', undefined, {
	// 		detach: true,
	// 	});

	// 	const maxWidth = sizePayload.maxWidth;
	// 	const maxHeight = sizePayload.maxHeight;
	// 	const maxFilesize = sizePayload.maxFilesize;

	// 	Growls.error({
	// 		title: this.$gettext('Oh no!'),
	// 		message: this.$gettextInterpolate(
	// 			"It looks like your image's filesize or dimensions are too large. Its filesize must be less than %{ filesize } and its dimensions less than %{ width }×%{ height }",
	// 			{ width: maxWidth, height: maxHeight, size: maxFilesize }
	// 		),
	// 	});

	// 	editorRemoveMediaUpload(this.task);
	// 	return;
	// }
}

function _handleProgressEvent(e: ProgressEvent | null) {
	if (e !== null) {
		task.updateProgress(e.loaded / e.total);
	} else {
		task.updateProgress(1);
	}
}
</script>

<template>
	<div class="media-upload-container">
		<div class="media-upload">
			<img
				v-if="task.thumbnail"
				:src="task.thumbnail"
				class="-placeholder"
				:style="{ 'max-height': placeholderMaxHeight + 'px' }"
			/>
			<AppLoading v-else centered />
			<div class="-progress-container">
				<AppProgressBar
					class="-progress"
					thin
					:percent="task.progress * 100.0"
					:indeterminate="task.isProcessing"
					:active="task.isProcessing"
				/>
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.media-upload-container
	width: 100%
	display: flex
	justify-content: center
	cursor: default

.media-upload
	padding: 10px
	position: relative
	min-width: 200px
	min-height: 120px
	max-width: 400px
	max-height: 400px
	white-space: normal

.-placeholder
	margin: auto
	max-width: 95%
	filter: grayscale(80%) contrast(50%)
	display: block

.-progress-container
	position: absolute
	bottom: 0px
	left: 0px
	width: 100%
	margin-left: auto
	margin-right: auto
	padding-left: 10px
	padding-right: 10px
</style>
