import AppContentMediaUpload from '../../components/AppContentMediaUpload.vue';
import { BaseNodeView } from './base';

export class MediaUploadNodeView extends BaseNodeView {
	mounted() {
		this.mountVue(AppContentMediaUpload, {
			uploadId: this.node.attrs.uploadId,
			editorView: this.view,
		});
	}
}
