import { lift, toggleMark, wrapIn } from 'prosemirror-commands';
import { Mark, MarkType, Node } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import Vue from 'vue';
import { Component, InjectReactive, Prop, Watch } from 'vue-property-decorator';
import { MouseState } from '../../../../utils/mouse';
import { propRequired } from '../../../../utils/vue';
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
	@Prop(propRequired(Number)) stateCounter!: number;

	@InjectReactive(ContentEditorControllerKey)
	controller!: ContentEditorController;

	// CSS and styling
	visible = false;
	left = '0px';
	bottom = '0px';

	// State
	isShowingOnMouseUp = false;
	mouse: MouseState | null = null;
	selectionMarks: Mark<ContentEditorSchema>[] = [];
	isInHeading = false;
	headingLevel = -1;
	isAutolink = false;

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
		this.mouse = new MouseState();
		this.update();
	}

	@Watch('stateCounter')
	private async update() {
		if (this.view instanceof EditorView) {
			const state = this.view.state;

			if (!state.selection.empty) {
				const node = ContentEditorService.getSelectedNode(this.view.state);

				if (
					node !== null &&
					(node.type.name === 'text' || node.type.name === 'paragraph')
				) {
					const parent = ContentEditorService.getParentNode(this.view.state, node);

					// Make sure that marks can be applied to the parent of this text
					if (parent && parent.type.spec.marks !== '') {
						this.selectionMarks = ContentEditorService.getSelectionMarks(
							this.view.state
						);
						// Find the parent heading level
						const headingParentNode = this.testIsInHeading(node);
						if (headingParentNode instanceof Node) {
							this.isInHeading = true;
							this.headingLevel = headingParentNode.attrs.level;
						} else {
							this.isInHeading = false;
							this.headingLevel = -1;
						}

						this.isAutolink =
							node.isText &&
							node.marks.some(m => m.type.name === 'link' && !!m.attrs.autolink);

						// When the controls are already visible, just adjust their position
						// This also applies for when we are waiting for the mouse button to be released

						// When the mouse button is down and the controls aren't showing, we want to wait before
						// showing them. Otherwise, when moving the selection upwards, the controls can get in the way
						if (this.visible || this.isShowingOnMouseUp) {
							this.setPosition();
							return;
						}

						if (this.mouse!.isButtonDown('left')) {
							document.addEventListener('mouseup', this.mouseUpHandler);
							this.isShowingOnMouseUp = true;
						} else {
							this.show();
						}

						return;
					}
				}
			}
		}

		this.visible = false;
	}

	private mouseUpHandler(e: MouseEvent) {
		if (e.button === 0) {
			document.removeEventListener('mouseup', this.mouseUpHandler);
			this.isShowingOnMouseUp = false;
			this.show();
		}
	}

	private async show() {
		this.visible = true;
		// Wait a tick for the controls to mount to the dom so the position gets calculated correctly.
		await this.$nextTick();

		this.setPosition();
	}

	private setPosition() {
		const { from, to } = this.view.state.selection;
		const start = this.view.coordsAtPos(from);
		const end = this.view.coordsAtPos(to);
		const box = this.$refs.container.offsetParent!.getBoundingClientRect();

		const left =
			Math.max((start.left + end.left) / 2, start.left + 3) -
			this.$refs.container.clientWidth / 2;

		this.left = left - box.left + 'px';
		// max/min are used to constrain the controls within the scrolling view.
		this.bottom = Math.max(0, Math.min(box.height, box.bottom - start.top)) + 16 + 'px';
	}

	private hasMark(markType: string) {
		return this.selectionMarks.some(m => m.type.name === markType);
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
		if (this.hasMark('link')) {
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
