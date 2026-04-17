import AppContentMediaItem from '~common/content/components/AppContentMediaItem.vue';
import { ContentEditorService } from '~common/content/content-editor/content-editor.service';
import { BaseNodeView } from '~common/content/content-editor/node-views/base';

export class MediaItemNodeView extends BaseNodeView {
	mounted() {
		this.mountVue(AppContentMediaItem, {
			mediaItemId: this.node.attrs.id,
			mediaItemWidth: this.node.attrs.width,
			mediaItemHeight: this.node.attrs.height,
			caption: this.node.attrs.caption,
			align: this.node.attrs.align,
			href: this.node.attrs.href,
			isDisabled: ContentEditorService.isDisabled(this.view),
		});
	}
}
