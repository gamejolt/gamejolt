import { nextTick } from 'vue';
import { Emit, Inject, Options, Vue } from 'vue-property-decorator';
import AppEmoji, { GJ_EMOJIS } from '../../../../emoji/AppEmoji.vue';
import { AppTooltip } from '../../../../tooltip/tooltip-directive';
import {
	ContentEditorController,
	ContentEditorControllerKey,
	editorInsertEmoji,
} from '../../content-editor-controller';

@Options({
	components: {
		AppEmoji,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppContentEditorControlsEmoji extends Vue {
	@Inject({ from: ContentEditorControllerKey })
	controller!: ContentEditorController;

	emoji = 'huh'; // gets set to a random one at mounted
	panelVisible = false;
	clickedWithPanelVisible = false;

	declare $refs: {
		panel: HTMLElement;
	};

	@Emit('visibility-change')
	emitVisibilityChange(_visible: boolean) {}

	get visible() {
		return this.controller.scope.isFocused && this.controller.capabilities.emoji;
	}

	get emojis() {
		return GJ_EMOJIS;
	}

	private setPanelVisibility(visible: boolean) {
		if (this.panelVisible !== visible) {
			this.panelVisible = visible;
			this.emitVisibilityChange(visible);
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
		await nextTick();
		this.$refs.panel.focus();
	}
}
