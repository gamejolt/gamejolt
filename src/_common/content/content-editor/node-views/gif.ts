import AppContentGif from '~common/content/components/AppContentGif.vue';
import { ContentEditorService } from '~common/content/content-editor/content-editor.service';
import { BaseNodeView } from '~common/content/content-editor/node-views/base';

export class GifNodeView extends BaseNodeView {
	mounted() {
		this.mountVue(AppContentGif, {
			gifId: this.node.attrs.id,
			width: this.node.attrs.width,
			height: this.node.attrs.height,
			service: this.node.attrs.service,
			media: this.node.attrs.media,
			url: this.node.attrs.url,
			isDisabled: ContentEditorService.isDisabled(this.view),
		});
	}
}
