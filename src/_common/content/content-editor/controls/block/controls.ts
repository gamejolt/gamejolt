import { Node } from 'prosemirror-model';
import { Selection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import { AppTooltip } from '../../../../../components/tooltip/tooltip';
import { Growls } from '../../../../growls/growls.service';
import { Screen } from '../../../../screen/screen-service';
import { ContextCapabilities } from '../../../content-context';
import { ContentEditorService } from '../../content-editor.service';
import { ContentEditorSchema } from '../../schemas/content-editor-schema';

@Component({
	components: {},
	directives: {
		AppTooltip,
	},
})
export default class AppContentEditorBlockControls extends Vue {
	@Prop(Object)
	view!: EditorView<ContentEditorSchema>;
	@Prop(Number)
	stateCounter!: number;
	@Prop(Object)
	capabilities!: ContextCapabilities;
	@Prop(Boolean)
	collapsed!: boolean;

	visible = false;
	top = '0px';
	left = '0px';

	readonly Screen = Screen;

	$refs!: {
		container: HTMLElement;
	};

	mounted() {
		this.update();
	}

	@Watch('stateCounter')
	private update() {
		if (this.view instanceof EditorView) {
			const state = this.view.state;
			const node = ContentEditorService.getSelectedNode(this.view.state);

			if (node !== null && node.type.name === 'paragraph' && state.selection.empty) {
				this.visible = true;

				const start = this.view.coordsAtPos(state.selection.from);

				// Offset the controls if there's a heading node.
				const headingNode = this.testIsInHeading(node);
				if (headingNode instanceof Node) {
					if (headingNode.attrs.level === 1) {
						start.top += 8;
					} else {
						start.top += 6;
					}
				}

				const box = this.$refs.container.offsetParent.getBoundingClientRect();
				this.top = start.top - box.top - 8 + 'px';
				this.left = '-32px';

				return;
			}
		}
		this.visible = false;
		this.setCollapsed(true);
	}

	testIsInHeading(node: Node<ContentEditorSchema>) {
		if (!this.capabilities.heading) {
			return false;
		}
		return ContentEditorService.isContainedInNode(
			this.view.state,
			node,
			this.view.state.schema.nodes.heading
		);
	}

	private setCollapsed(value: boolean) {
		this.$emit('collapsedChanged', value);
	}

	onClickExpand() {
		this.setCollapsed(!this.collapsed);
	}

	/**
	 * Replaces the empty paragraph with the new node.
	 */
	private insertNewNode(newNode: Node<ContentEditorSchema>) {
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

		this.setCollapsed(true);
	}

	onClickMedia() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.png,.jpg,.jpeg,.gif,.bmp';
		input.multiple = true;

		input.onchange = e => {
			if (e.target instanceof HTMLInputElement) {
				const files = e.target.files;
				if (files !== null) {
					for (let i = 0; i < files.length; i++) {
						const file = files[i];
						const result = ContentEditorService.handleImageFile(this.view, file);
						if (!result) {
							Growls.error({
								title: this.$gettext('Invalid file selected'),
								message: this.$gettextInterpolate(
									'"%{ filename }" is not a valid image file.',
									{ filename: file.name }
								),
							});
						}
					}
				}
			}
		};

		input.click();
	}

	onClickEmbed() {
		const newNode = this.view.state.schema.nodes.embed.create();
		this.insertNewNode(newNode);
	}

	onClickCodeBlock() {
		const newNode = this.view.state.schema.nodes.codeBlock.create();
		this.insertNewNode(newNode);
	}

	onClickBlockquote() {
		const contentNode = this.view.state.schema.nodes.paragraph.create();
		const newNode = this.view.state.schema.nodes.blockquote.create({}, contentNode);
		this.insertNewNode(newNode);
	}

	onClickHr() {
		const newNode = this.view.state.schema.nodes.hr.create();
		this.insertNewNode(newNode);
	}

	onClickSpoiler() {
		const contentNode = this.view.state.schema.nodes.paragraph.create();
		const newNode = this.view.state.schema.nodes.spoiler.create({}, contentNode);
		this.insertNewNode(newNode);
	}

	onClickBulletList() {
		const contentNode = this.view.state.schema.nodes.paragraph.create();
		const listItemNode = this.view.state.schema.nodes.listItem.create({}, contentNode);
		const newNode = this.view.state.schema.nodes.bulletList.create({}, listItemNode);
		this.insertNewNode(newNode);
	}

	onClickOrderedList() {
		const contentNode = this.view.state.schema.nodes.paragraph.create();
		const listItemNode = this.view.state.schema.nodes.listItem.create({}, contentNode);
		const newNode = this.view.state.schema.nodes.orderedList.create({}, listItemNode);
		this.insertNewNode(newNode);
	}
}
