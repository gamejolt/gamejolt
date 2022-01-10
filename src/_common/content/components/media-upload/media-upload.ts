import { EditorView } from 'prosemirror-view';
import { Inject, Options, Prop, Vue } from 'vue-property-decorator';
import { Api } from '../../../api/api.service';
import { showErrorGrowl } from '../../../growls/growls.service';
import AppLoading from '../../../loading/loading.vue';
import { MediaItem } from '../../../media-item/media-item-model';
import AppProgressBar from '../../../progress/bar/bar.vue';
import { getMediaItemTypeForContext } from '../../content-context';
import {
	editorMediaUploadCancel,
	editorMediaUploadFinalize,
} from '../../content-editor/content-editor-controller';
import { ContentEditorService } from '../../content-editor/content-editor.service';
import { MediaUploadTask } from '../../content-editor/media-upload-task';
import { ContentEditorSchema } from '../../content-editor/schemas/content-editor-schema';
import { ContentOwnerController, ContentOwnerControllerKey } from '../../content-owner';

@Options({
	components: {
		AppProgressBar,
		AppLoading,
	},
})
export default class AppContentMediaUpload extends Vue {
	@Prop(String)
	uploadId!: string;

	@Prop({ type: EditorView })
	editorView!: EditorView<ContentEditorSchema>;

	@Inject({ from: ContentOwnerControllerKey })
	owner!: ContentOwnerController;

	// We pull from the upload task cache to populate this.
	task: MediaUploadTask = null as any;

	get placeholderMaxHeight() {
		const maxHeight = this.owner.contentRules.maxMediaHeight;
		if (maxHeight !== null) {
			return maxHeight;
		}
		return 260;
	}

	created() {
		this.task = ContentEditorService.UploadTaskCache[this.uploadId]!;
	}

	mounted() {
		// In the app, we don't handle the upload. The app will do it all.
		if (!GJ_IS_DESKTOP_APP) {
			this.uploadFile();
		}
	}

	private async uploadFile() {
		let file = this.task.file!;

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
			const mediaItem = await this.doUpload(file);
			if (mediaItem instanceof MediaItem) {
				editorMediaUploadFinalize(this.task, mediaItem);
			}
		} catch (error) {
			editorMediaUploadCancel(this.task);

			showErrorGrowl({
				title: this.$gettext('Oh no!'),
				message: this.$gettext('Something went wrong while uploading your image.'),
			});
		}
	}

	private async doUpload(file: File) {
		this.task.progress = 0;
		this.task.isProcessing = false;

		const itemType = getMediaItemTypeForContext(this.owner.context);
		const parentId = await this.owner.modelId;
		const payload = await Api.sendRequest(
			'/web/dash/media-items/add-one',
			{
				type: itemType,
				parent_id: parentId,
			},
			{
				file,
				progress: this.handleProgressEvent,
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

	private handleProgressEvent(e: ProgressEvent | null) {
		if (e !== null) {
			this.task.updateProgress(e.loaded / e.total);
		} else {
			this.task.updateProgress(1);
		}
	}
}
