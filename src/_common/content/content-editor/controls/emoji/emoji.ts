import Vue from 'vue';
import { Component, InjectReactive } from 'vue-property-decorator';
import { AppTooltip } from '../../../../tooltip/tooltip-directive';
import {
	ContentEditorController,
	ContentEditorControllerKey,
	editorInsertEmoji,
} from '../../content-editor-controller';
import { GJ_EMOJIS } from '../../schemas/specs/nodes/gj-emoji-nodespec';

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppContentEditorControlsEmoji extends Vue {
	@InjectReactive(ContentEditorControllerKey)
	controller!: ContentEditorController;

	emoji = 'huh'; // gets set to a random one at mounted
	panelVisible = false;
	clickedWithPanelVisible = false;

	$refs!: {
		panel: HTMLElement;
	};

	get visible() {
		return this.controller.scope.isFocused && this.controller.capabilities.emoji;
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
			this.$emit('visibility-change', visible);
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
			this.show();
		}
	}

	onPanelFocus() {
		this.setPanelVisibility(true);
	}

	onPanelBlur() {
		this.setPanelVisibility(false);
	}

	onClickEmoji(emojiType: string) {
		editorInsertEmoji(this.controller, emojiType);
	}

	public async show() {
		this.setPanelVisibility(true);
		await Vue.nextTick();
		this.$refs.panel.focus();
	}
}
