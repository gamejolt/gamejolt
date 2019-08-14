import AppContentMediaUpload from '../../components/media-upload/media-upload.vue';
import { HydratableNodeView } from './hydratable';

export class MediaUploadNodeView extends HydratableNodeView {
	mounted() {
		const vm = new AppContentMediaUpload({
			propsData: {
				uploadId: this.node.attrs.uploadId,
				editorView: this.view,
				owner: this.owner,
			},
		});
		this.mountVue(vm);
	}
}
