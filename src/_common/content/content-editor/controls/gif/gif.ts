import Vue from 'vue';
import Component from 'vue-class-component';
import { InjectReactive } from 'vue-property-decorator';
import { AppTooltip } from '../../../../tooltip/tooltip-directive';
import {
	ContentEditorController,
	ContentEditorControllerKey,
	editorInsertGif,
} from '../../content-editor-controller';
import { ContentEditorGifModal } from '../../modals/gif/gif-modal.service';

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppContentEditorControlsGif extends Vue {
	@InjectReactive(ContentEditorControllerKey)
	controller!: ContentEditorController;

	get view() {
		return this.controller.view!;
	}

	get visible() {
		return this.controller.scope.isFocused && this.controller.capabilities.gif;
	}

	async openGifModal() {
		const gif = await ContentEditorGifModal.show();
		if (gif === undefined) {
			return;
		}

		editorInsertGif(this.controller, gif);
	}
}
