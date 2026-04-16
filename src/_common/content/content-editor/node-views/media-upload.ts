import AppContentMediaUpload from '~common/content/components/AppContentMediaUpload.vue';
import { BaseNodeView } from '~common/content/content-editor/node-views/base';

export class MediaUploadNodeView extends BaseNodeView {
	mounted() {
		this.mountVue(AppContentMediaUpload, {
			uploadId: this.node.attrs.uploadId,
			editorView: this.view,
		});
	}
}
