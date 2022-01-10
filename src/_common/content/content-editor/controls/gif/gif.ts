import { Inject, Options, Vue } from 'vue-property-decorator';
import { AppTooltip } from '../../../../tooltip/tooltip-directive';
import {
	ContentEditorController,
	ContentEditorControllerKey,
	editorInsertGif,
} from '../../content-editor-controller';
import { ContentEditorGifModal } from '../../modals/gif/gif-modal.service';

@Options({
	directives: {
		AppTooltip,
	},
})
export default class AppContentEditorControlsGif extends Vue {
	@Inject({ from: ContentEditorControllerKey })
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
