import { EditorView } from 'prosemirror-view';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import { ContentEditorSchema } from '../../schemas/content-editor-schema';

@Component({})
export default class AppContentEditorControlsInsetContainer extends Vue {
	@Prop(EditorView)
	view!: EditorView<ContentEditorSchema>;
	@Prop(Number)
	stateCounter!: number;

	visible = false;
	top = 0;
	boxHeight = 0;

	$refs!: {
		container: HTMLDivElement;
	};

	get shouldShow() {
		return this.visible && this.top > 8 && this.boxHeight - this.top > 12;
	}

	@Watch('stateCounter')
	update() {
		if (this.view instanceof EditorView) {
			const start = this.view.coordsAtPos(this.view.state.selection.from);

			const box = this.$refs.container.offsetParent.getBoundingClientRect();
			this.boxHeight = box.height;
			this.top = start.top - box.top;

			this.visible = true;
		} else {
			this.visible = false;
		}
	}
}
