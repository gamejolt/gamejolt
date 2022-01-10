import AppContentMediaUpload from '../../components/media-upload/media-upload.vue';
import { HydratableNodeView } from './hydratable';

export class MediaUploadNodeView extends HydratableNodeView {
	mounted() {
		// TODO(vue3)
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
