import { EditorView } from 'prosemirror-view';
import Vue from 'vue';
import { Component, InjectReactive, Prop, Watch } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { AppTooltip } from '../../../../tooltip/tooltip-directive';
import {
	ContentEditorController,
	ContentEditorControllerKey,
} from '../../content-editor-controller';
import { ContentEditorSchema } from '../../schemas/content-editor-schema';
import { GJ_EMOJIS } from '../../schemas/specs/nodes/gj-emoji-nodespec';

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppContentEditorControlsEmoji extends Vue {
	@Prop(propRequired(EditorView)) view!: EditorView<ContentEditorSchema>;
	@Prop(propRequired(Number)) stateCounter!: number;

	@InjectReactive(ContentEditorControllerKey)
	controller!: ContentEditorController;

	visible = false;
	emoji = 'huh'; // gets set to a random one at mounted
	panelVisible = false;
	clickedWithPanelVisible = false;

	$refs!: {
		panel: HTMLElement;
	};

	created() {
		this.update();
	}

	@Watch('stateCounter')
	update() {
		this.visible = this.canInsertEmoji();
	}

	get spanClass() {
		let className = 'emoji emoji-' + this.emoji;
		if (this.panelVisible) {
			className += ' emoji-button-active';
		}
		return className;
	}

	get emojis() {
		return GJ_EMOJIS;
	}

	private setPanelVisibility(visible: boolean) {
		if (this.panelVisible !== visible) {
			this.panelVisible = visible;
			this.$emit('visibilitychange', visible);
		}
	}

	private setRandomEmoji() {
		const prev = this.emoji;
		do {
			const emojiIndex = Math.floor(Math.random() * GJ_EMOJIS.length);
			this.emoji = GJ_EMOJIS[emojiIndex];
		} while (prev === this.emoji);
	}

	mounted() {
		this.setRandomEmoji();
	}

	onMouseEnter() {
		if (!this.panelVisible) {
			this.setRandomEmoji();
		}
	}

	onMouseDown() {
		this.clickedWithPanelVisible = this.panelVisible;
	}

	onButtonClick() {
		if (this.clickedWithPanelVisible) {
			this.setPanelVisibility(false);
		} else {
			if (this.controller.embedded) {
				const message = {
					action: 'emojiSelector',
				};
				(window as any).gjEditorChannel.postMessage(JSON.stringify(message));
			} else {
				this.show();
			}
		}
	}

	onPanelFocus() {
		this.setPanelVisibility(true);
	}

	onPanelBlur() {
		this.setPanelVisibility(false);
	}

	private canInsertEmoji() {
		const emojiNodeType = this.view.state.schema.nodes.gjEmoji;
		const { $from } = this.view.state.selection;
		const index = $from.index();
		return $from.parent.canReplaceWith(index, index, emojiNodeType);
	}

	onClickEmoji(emojiType: string) {
		const emojiNodeType = this.view.state.schema.nodes.gjEmoji;

		if (this.canInsertEmoji()) {
			const tr = this.view.state.tr;
			tr.replaceSelectionWith(emojiNodeType.create({ type: emojiType }));
			this.view.dispatch(tr);
			this.view.focus();
		}
	}

	public async show() {
		this.setPanelVisibility(true);
		await Vue.nextTick();
		this.$refs.panel.focus();
	}
}
