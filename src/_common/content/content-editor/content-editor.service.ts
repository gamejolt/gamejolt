import { Fragment, Mark, Node, NodeType } from 'prosemirror-model';
import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { imageMimeTypes, isImage } from '../../../utils/image';
import { uuidv4 } from '../../../utils/uuid';
import { ContentEditorSchema } from './schemas/content-editor-schema';

export class ContentEditorService {
	public static UploadFileCache: { [uploadId: string]: File | undefined } = {};

	/**
	 * Ensures that the last node in the editor doc is a specific node.
	 */
	public static ensureEndNode(
		tr: Transaction<ContentEditorSchema>,
		nodeType: NodeType<ContentEditorSchema>
	) {
		if (tr.doc.lastChild && tr.doc.lastChild.type.name !== nodeType.name) {
			const newNode = nodeType.create();
			return tr.insert(tr.doc.nodeSize - 2, newNode);
		}
		return null;
	}

	public static getSelectedNode(state: EditorState<ContentEditorSchema>) {
		let selFrom = state.selection.from;
		let node = state.doc.nodeAt(selFrom);
		// If the selection is between nodes, make sure we select the correct one.
		if (node === null && selFrom > 0) {
			selFrom--;
			node = state.doc.nodeAt(selFrom);
		}
		if (node === undefined) {
			return null;
		}
		return node;
	}

	private static findParentNode(
		proposedParent: Node<ContentEditorSchema>,
		child: Node<ContentEditorSchema>
	): Node<ContentEditorSchema> | null {
		for (let i = 0; i < proposedParent.childCount; i++) {
			const parentChild = proposedParent.child(i);
			if (parentChild === child) {
				return proposedParent;
			} else {
				const maybeParent = this.findParentNode(parentChild, child);
				if (maybeParent !== null) {
					return maybeParent;
				}
			}
		}

		return null;
	}

	public static getParentNode(
		state: EditorState<ContentEditorSchema>,
		child: Node<ContentEditorSchema>
	) {
		return this.findParentNode(state.doc, child);
	}

	/**
	 * Returns a list of all applied to any node within the selection
	 */
	public static getSelectionMarks(state: EditorState<ContentEditorSchema>) {
		const markTypes: Mark<ContentEditorSchema>[] = [];
		state.doc.nodesBetween(
			state.selection.from,
			state.selection.to,
			(node: Node<ContentEditorSchema>, _0: number, _1: Node, _2: number) => {
				for (const mark of node.marks) {
					if (!markTypes.some(m => m.type.name === mark.type.name)) {
						markTypes.push(mark);
					}
				}
			}
		);
		return markTypes;
	}

	/**
	 * Indicates whether the given node is contained in a node of the given type.
	 * Returns the parent node that matched, or `false`.
	 */
	public static isContainedInNode(
		state: EditorState<ContentEditorSchema>,
		node: Node<ContentEditorSchema>,
		nodeType: NodeType<ContentEditorSchema>
	) {
		if (node.type.name === nodeType.name) {
			return node;
		}

		let child = node;
		let parent = this.getParentNode(state, node);
		while (parent !== null) {
			if (parent.type.name === nodeType.name) {
				return parent;
			}

			// Walk up
			child = parent;
			parent = this.getParentNode(state, child);
		}
		return false;
	}

	public static handleImageUploads(
		view: EditorView<ContentEditorSchema>,
		items: DataTransferItemList
	) {
		let handled = false;

		for (let i = 0; i < items.length; i++) {
			const transferItem = items[i];

			if (
				transferItem.kind === 'file' &&
				imageMimeTypes.includes(transferItem.type.toLowerCase())
			) {
				const result = this.handleImageFile(view, transferItem.getAsFile());
				if (result) {
					handled = true;
				}
			}
		}
		return handled;
	}

	public static handleImageFile(view: EditorView<ContentEditorSchema>, file: File | null) {
		if (file !== null && isImage(file)) {
			const uploadId = uuidv4();
			this.UploadFileCache[uploadId] = file;
			const newNode = view.state.schema.nodes.mediaUpload.create({
				uploadId,
			});
			const tr = view.state.tr.replaceSelectionWith(newNode);
			view.focus();
			view.dispatch(tr);
			return true;
		}

		return false;
	}

	public static findNodePosition(
		state: EditorState<ContentEditorSchema>,
		node: Node<ContentEditorSchema>
	) {
		let found = -1;
		state.doc.descendants((child, pos) => {
			if (found > -1) {
				return false;
			}
			if (child === node) {
				found = pos;
				return false;
			}
		});

		if (found === -1) {
			throw new Error('Node not found in document');
		}

		return found;
	}

	public static isDisabled(view: EditorView<ContentEditorSchema>) {
		return !!view.props.editable && !view.props.editable(view.state);
	}

	public static getSelectedText(state: EditorState<ContentEditorSchema>): string {
		if (state.selection.empty) {
			return '';
		}

		const selectionContent = state.selection.content().content;
		return this.getFragmentText(selectionContent);
	}

	public static getFragmentText(
		frag: Fragment<ContentEditorSchema> | Node<ContentEditorSchema>
	): string {
		const textNodes = this.getTextNodes(frag);

		let text = '';
		for (const textNode of textNodes) {
			if (textNode.type.name === 'hardBreak') {
				text += '\n';
			} else {
				text += textNode.text;
			}
		}
		return text;
	}

	private static getTextNodes(
		node: Fragment<ContentEditorSchema> | Node<ContentEditorSchema>
	): Node<ContentEditorSchema>[] {
		const nodes = [];

		for (let i = 0; i < node.childCount; i++) {
			const child = node.child(i);
			if (child.isText || child.type.name === 'hardBreak') {
				nodes.push(child);
			} else {
				nodes.push(...this.getTextNodes(child));
			}
		}

		return nodes;
	}

	public static checkCurrentNodeIsCode(state: EditorState<ContentEditorSchema>) {
		const node = this.getSelectedNode(state);
		if (node instanceof Node && node.type.name === 'text') {
			if (node.marks.some(m => m.type.name === 'code')) {
				return true;
			} else {
				const parent = this.getParentNode(state, node);
				if (parent instanceof Node && parent.type.name === 'codeBlock') {
					return true;
				}
			}
		}
		return false;
	}
}
