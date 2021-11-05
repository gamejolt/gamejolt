import { lift, toggleMark, wrapIn } from 'prosemirror-commands';
import { MarkType, Node } from 'prosemirror-model';
import Vue from 'vue';
import { Component, InjectReactive, Watch } from 'vue-property-decorator';
import { Screen } from '../../../screen/screen-service';
import { AppTooltip } from '../../../tooltip/tooltip-directive';
import { ContentEditorController, ContentEditorControllerKey } from '../content-editor-controller';
import { ContentEditorService } from '../content-editor.service';
import { ContentEditorLinkModal } from '../modals/link/link-modal.service';
import { ContentEditorSchema } from '../schemas/content-editor-schema';

@Component({
	directives: {
		AppTooltip,
	},
})
export default class AppContentEditorTextControls extends Vue {
	@InjectReactive(ContentEditorControllerKey)
	controller!: ContentEditorController;

	private containerWidth = 100;
	private oldLeft = '0px';
	private oldBottom = '0px';

	readonly Screen = Screen;

	$refs!: {
		container: HTMLElement;
	};

	get contextCapabilities() {
		return this.controller.contextCapabilities;
	}

	get view() {
		return this.controller.view!;
	}

	get shouldShowHeading() {
		return this.contextCapabilities.heading && (this.isInHeading || this.testWrapInHeading());
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
		await this.$nextTick();
		if (this.visible) {
			// Wait for the container to become visible before getting width.
			this.containerWidth = this.$refs.container.clientWidth;
		}
	}

	private hasMark(markType: keyof typeof this.controller.scope) {
		return !!this.controller.scope[markType];
	}

	private dispatchMark(mark: MarkType<ContentEditorSchema>, attrs?: { [key: string]: any }) {
		toggleMark(mark, attrs)(this.view.state, tr => {
			this.view.dispatch(tr);
		});
	}

	onClickBold() {
		this.dispatchMark(this.view.state.schema.marks.strong);
	}

	onClickItalic() {
		this.dispatchMark(this.view.state.schema.marks.em);
	}

	onClickStrikethrough() {
		this.dispatchMark(this.view.state.schema.marks.strike);
	}

	onClickCode() {
		this.dispatchMark(this.view.state.schema.marks.code);
	}

	async onClickLink() {
		if (this.hasMark('link') || this.isAutolink) {
			// Remove the link mark
			this.dispatchMark(this.view.state.schema.marks.link);
		} else {
			const selectedText = ContentEditorService.getSelectedText(this.view.state);
			const result = await ContentEditorLinkModal.show(selectedText);
			if (result) {
				this.dispatchMark(this.view.state.schema.marks.link, {
					href: result.href,
					title: result.title,
				});
			}
		}
	}

	testWrapInHeading() {
		return wrapIn(this.view.state.schema.nodes.heading, { level: 1 })(this.view.state);
	}

	testIsInHeading(node: Node<ContentEditorSchema>) {
		if (!this.contextCapabilities.heading) {
			return false;
		}
		return ContentEditorService.isContainedInNode(
			this.view.state,
			node,
			this.view.state.schema.nodes.heading
		);
	}

	liftFromHeading() {
		const node = ContentEditorService.getSelectedNode(this.view.state);
		if (node !== null) {
			let lifted;
			do {
				lifted = lift(this.view.state, this.view.dispatch);
			} while (lifted && this.testIsInHeading(node));
		}
	}

	doWrapInHeading(level: number) {
		wrapIn(this.view.state.schema.nodes.heading, { level })(
			this.view.state,
			this.view.dispatch
		);
	}

	onClickHeading(level: number) {
		if (this.isInHeading) {
			if (level === this.headingLevel) {
				this.liftFromHeading();
			} else {
				const node = ContentEditorService.getSelectedNode(this.view.state);
				if (node instanceof Node) {
					const headingParentNode = this.testIsInHeading(node);
					if (headingParentNode instanceof Node) {
						const nodePos = ContentEditorService.findNodePosition(
							this.view.state,
							headingParentNode
						);
						const tr = this.view.state.tr;
						tr.setNodeMarkup(nodePos, undefined, { level });
						this.view.dispatch(tr);
					}
				}
			}
		} else {
			this.doWrapInHeading(level);
		}
	}
}
