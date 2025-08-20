import AppContentCustomButton from '../../components/AppContentCustomButton.vue';
import { ContentEditorService } from '../content-editor.service';
import { BaseNodeView } from './base';

export class CustomButtonNodeView extends BaseNodeView {
	mounted() {
		this.mountVue(AppContentCustomButton, {
			customButtonId: this.node.attrs.id,
			isDisabled: ContentEditorService.isDisabled(this.view),
		});
	}
}
