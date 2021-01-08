import { Selection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { AppTooltip } from '../../../../tooltip/tooltip-directive';
import { ContentEditorService } from '../../content-editor.service';
import { ContentEditorGifModal } from '../../modals/gif/gif-modal.service';

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppContentEditorControlsGif extends Vue {
	@Prop(propRequired(EditorView)) view!: EditorView;
	@Prop(propRequired(Number)) stateCounter!: number;

	visible = false;

	created() {
		this.update();
	}

	@Watch('stateCounter')
	update() {
		if (this.view instanceof EditorView) {
			const state = this.view.state;
			const node = ContentEditorService.getSelectedNode(this.view.state);

			this.visible = node !== null && node.type.name === 'paragraph' && state.selection.empty;
		} else {
			this.visible = false;
		}
	}

	async openGifModal() {
		const gif = await ContentEditorGifModal.show();
		if (gif !== undefined) {
			const newNode = this.view.state.schema.nodes.gif.create({
				id: gif.id,
				width: gif.width,
				height: gif.height,
				service: 'tenor',
				media: { webm: gif.webm, mp4: gif.mp4, preview: gif.preview },
				url: gif.url,
			});

			const tr = this.view.state.tr;
			tr.replaceWith(
				this.view.state.selection.from - 1,
				this.view.state.selection.to + 1,
				newNode
			);

			const resolvedCursorPos = tr.doc.resolve(this.view.state.selection.from);
			const selection = Selection.near(resolvedCursorPos);
			tr.setSelection(selection);
			ContentEditorService.ensureEndNode(tr, this.view.state.schema.nodes.paragraph);

			this.view.focus();
			this.view.dispatch(tr);
		}
	}
}
