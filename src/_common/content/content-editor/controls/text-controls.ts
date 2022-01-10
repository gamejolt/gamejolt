import { nextTick } from 'vue';
import { Inject, Options, Vue, Watch } from 'vue-property-decorator';
import { Screen } from '../../../screen/screen-service';
import { AppTooltip } from '../../../tooltip/tooltip-directive';
import {
	ContentEditorController,
	ContentEditorControllerKey,
	editorGetSelectedText,
	editorLink,
	editorToggleHeading,
	editorToggleMark,
	editorUnlink,
} from '../content-editor-controller';
import { ContentEditorLinkModal } from '../modals/link/link-modal.service';

@Options({
	directives: {
		AppTooltip,
	},
})
export default class AppContentEditorTextControls extends Vue {
	@Inject({ from: ContentEditorControllerKey })
	controller!: ContentEditorController;

	private containerWidth = 100;
	private oldLeft = '0px';
	private oldBottom = '0px';

	readonly Screen = Screen;

	declare $refs: {
		container: HTMLElement;
	};

	get contextCapabilities() {
		return this.controller.contextCapabilities;
	}

	get view() {
		return this.controller.view!;
	}

	get shouldShowHeading() {
		const { h1, h2 } = this.controller.capabilities;
		return h1 && h2;
	}

	mounted() {
		this.onVisibleChanged();
	}

	get visible() {
		if (!this.controller.scope.hasSelection) {
			return false;
		}

		return this.controller.capabilities.hasTextControls;
	}

	get isAutolink() {
		return !!this.controller.scope.autolink;
	}

	get isInHeading() {
		return this.headingLevel !== null;
	}

	get headingLevel() {
		return this.controller.scope.headingLevel;
	}

	get left() {
		const {
			scope: { cursorStart, cursorEnd },
			window,
		} = this.controller;

		if (!cursorStart || !cursorEnd || !this.visible) {
			return this.oldLeft;
		}

		const left =
			Math.max((cursorStart.left + cursorEnd.left) / 2, cursorStart.left + 3) -
			this.containerWidth / 2;

		this.oldLeft = left - window.left + 'px';
		return this.oldLeft;
	}

	get bottom() {
		const {
			scope: { cursorStart, cursorEnd },
			window,
		} = this.controller;

		if (!cursorStart || !cursorEnd || !this.visible) {
			return this.oldBottom;
		}

		// max/min are used to constrain the controls within the scrolling view.
		this.oldBottom =
			Math.max(0, Math.min(window.height, window.top + window.height - cursorStart.top)) +
			16 +
			'px';
		return this.oldBottom;
	}

	@Watch('visible')
	private async onVisibleChanged() {
		await nextTick();
		if (this.visible) {
			// Wait for the container to become visible before getting width.
			this.containerWidth = this.$refs.container.clientWidth;
		}
	}

	private hasMark(markType: keyof typeof this.controller.scope) {
		return !!this.controller.scope[markType];
	}

	onClickBold() {
		editorToggleMark(this.controller, this.view.state.schema.marks.strong);
	}

	onClickItalic() {
		editorToggleMark(this.controller, this.view.state.schema.marks.em);
	}

	onClickStrikethrough() {
		editorToggleMark(this.controller, this.view.state.schema.marks.strike);
	}

	onClickCode() {
		editorToggleMark(this.controller, this.view.state.schema.marks.code);
	}

	async onClickLink() {
		if (this.isAutolink) {
			return;
		}

		if (this.hasMark('link')) {
			// Remove the link mark
			editorUnlink(this.controller);
		} else {
			const selectedText = editorGetSelectedText(this.controller);
			const result = await ContentEditorLinkModal.show(selectedText);

			if (result) {
				editorLink(this.controller, result.href);
			}
		}
	}

	onClickHeading(level: 2 | 1) {
		editorToggleHeading(this.controller, level);
	}
}
