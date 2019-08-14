import { EditorView } from 'prosemirror-view';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import AppLoading from '../../../../vue/components/loading/loading.vue';
import { Api } from '../../../api/api.service';
import { Growls } from '../../../growls/growls.service';
import { MediaItem } from '../../../media-item/media-item-model';
import AppProgressBar from '../../../progress/bar/bar.vue';
import { getMediaItemTypeForContext } from '../../content-context';
import { ContentEditorService } from '../../content-editor/content-editor.service';
import { ContentEditorSchema } from '../../content-editor/schemas/content-editor-schema';
import { ContentOwner } from '../../content-owner';

@Component({
	components: {
		AppProgressBar,
		AppLoading,
	},
})
export default class AppContentMediaUpload extends Vue {
	@Prop(String)
	uploadId!: string;

	@Prop(EditorView)
	editorView!: EditorView<ContentEditorSchema>;

	@Prop(Object)
	owner!: ContentOwner;

	src = '';
	uploadProgress = 0;
	uploadProcessing = false;

	async mounted() {
		let file = ContentEditorService.UploadFileCache[this.uploadId]!;

		// Only preview the image if it's smaller than 5 Mb.
		if (file.size < 5000000) {
			const reader = new FileReader();
			reader.onloadend = () => {
				if (reader.result !== null) {
					this.src = reader.result.toString();
				}
			};
			reader.readAsDataURL(file);
		}

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
			const mediaItem = await this.uploadFile(file);
			if (mediaItem instanceof MediaItem) {
				const nodePos = this.findTargetNodePos();
				if (nodePos !== -1) {
					const tr = this.editorView.state.tr;
					tr.setNodeMarkup(nodePos, this.editorView.state.schema.nodes.mediaItem, {
						id: mediaItem.id,
						width: mediaItem.width,
						height: mediaItem.height,
						align: 'center',
						caption: '',
					});
					this.editorView.dispatch(tr);
				}
			}
		} catch (error) {
			const nodePos = this.findTargetNodePos();
			if (nodePos !== -1) {
				const tr = this.editorView.state.tr;
				tr.delete(nodePos, nodePos + 1);
				this.editorView.dispatch(tr);
			}

			Growls.error({
				title: 'Oh no!',
				message: 'Something went wrong while uploading your image.',
			});
		} finally {
			ContentEditorService.UploadFileCache[this.uploadId] = undefined;
		}
	}

	private async uploadFile(file: File) {
		this.uploadProgress = 0;
		this.uploadProcessing = false;
		const itemType = getMediaItemTypeForContext(this.owner.getContext());
		const parentId = await this.owner.getModelId();
		const $payload = await Api.sendRequest(
			'/web/dash/media-items/add',
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
		if ($payload.success && $payload.mediaItems && $payload.mediaItems.length === 1) {
			return new MediaItem($payload.mediaItems[0]);
		}
	}

	private handleProgressEvent(e: ProgressEvent | null) {
		if (e !== null) {
			this.uploadProgress = e.loaded / e.total;
			if (this.uploadProgress >= 1) {
				this.uploadProgress = 1;
				this.uploadProcessing = true;
			}
		} else {
			this.uploadProgress = 1;
			this.uploadProcessing = true;
		}
	}

	private findTargetNodePos() {
		// Loops through nodes trying to find the mediaUpload node with a matching uploadId
		for (let i = 0; i < this.editorView.state.doc.nodeSize; i++) {
			const node = this.editorView.state.doc.nodeAt(i);
			if (
				node !== null &&
				node !== undefined &&
				node.type.name === 'mediaUpload' &&
				node.attrs.uploadId === this.uploadId
			) {
				return i;
			}
		}
		return -1;
	}
}
