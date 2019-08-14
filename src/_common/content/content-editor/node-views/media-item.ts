import AppContentMediaItem from '../../components/media-item/media-item.vue';
import { ContentEditorService } from '../content-editor.service';
import { HydratableNodeView } from './hydratable';

export class MediaItemNodeView extends HydratableNodeView {
	mounted() {
		const vm = new AppContentMediaItem({
			propsData: {
				mediaItemId: this.node.attrs.id,
				mediaItemWidth: this.node.attrs.width,
				mediaItemHeight: this.node.attrs.height,
				caption: this.node.attrs.caption,
				align: this.node.attrs.align,
				href: this.node.attrs.href,
				owner: this.owner,
				isDisabled: ContentEditorService.isDisabled(this.view),
			},
		});
		this.mountVue(vm);
	}
}
