import AppContentGif from '../../components/gif/gif.vue';
import { ContentEditorService } from '../content-editor.service';
import { HydratableNodeView } from './hydratable';

export class GifNodeView extends HydratableNodeView {
	mounted() {
		// TODO(vue3)
		const vm = new AppContentGif({
			propsData: {
				gifId: this.node.attrs.id,
				width: this.node.attrs.width,
				height: this.node.attrs.height,
				service: this.node.attrs.service,
				media: this.node.attrs.media,
				url: this.node.attrs.url,
				owner: this.owner,
				isDisabled: ContentEditorService.isDisabled(this.view),
			},
		});
		this.mountVue(vm);
	}
}
