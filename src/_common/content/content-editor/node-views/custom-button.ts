import AppContentCustomButton from '~common/content/components/AppContentCustomButton.vue';
import { ContentEditorService } from '~common/content/content-editor/content-editor.service';
import { BaseNodeView } from '~common/content/content-editor/node-views/base';

export class CustomButtonNodeView extends BaseNodeView {
	mounted() {
		this.mountVue(AppContentCustomButton, {
			customButtonId: this.node.attrs.id,
			isDisabled: ContentEditorService.isDisabled(this.view),
		});
	}
}
