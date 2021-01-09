import { toggleMark } from 'prosemirror-commands';
import { Mark, MarkType, Node, NodeType } from 'prosemirror-model';
import { Selection, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { ContextCapabilities } from '../content-context';
import { SearchResult } from './modals/gif/gif-modal.service';
import { ContentEditorSchema } from './schemas/content-editor-schema';

export const ContentEditorControllerKey = Symbol('content-editor-controller');

export class ContentEditorController {
	view: EditorView<ContentEditorSchema> | null = null;
	contextCapabilities = ContextCapabilities.getEmpty();
	scope = new ContentEditorScope();
	capabilities = new ContentEditorScopeCapabilities();
}

/**
 * The state for our current cursor/selection. Stores things like which marks
 * are currently set, current block data, etc.
 */
class ContentEditorScope {
	bold: boolean;
	italic: boolean;
	strike: boolean;
	code: boolean;

	constructor(data?: Partial<ContentEditorScope>) {
		this.bold = data?.bold ?? false;
		this.italic = data?.italic ?? false;
		this.strike = data?.strike ?? false;
		this.code = data?.code ?? false;
	}

	toJson() {
		return { b: this.bold, i: this.italic, s: this.strike, c: this.code };
	}
}

/**
 * Stores the current capabilities within the editor for our current
 * cursor/selection.
 */
class ContentEditorScopeCapabilities {
	bold: boolean;
	italic: boolean;
	strike: boolean;
	code: boolean;
	emoji: boolean;
	gif: boolean;

	constructor(data?: Partial<ContentEditorScopeCapabilities>) {
		this.bold = data?.bold ?? false;
		this.italic = data?.italic ?? false;
		this.strike = data?.strike ?? false;
		this.code = data?.code ?? false;
		this.emoji = data?.emoji ?? false;
		this.gif = data?.gif ?? false;
	}

	toJson() {
		return {
			b: this.bold,
			i: this.italic,
			s: this.strike,
			c: this.code,
			emoji: this.emoji,
			gif: this.gif,
		};
	}
}

/**
 * Syncs our editor's capabilities to what is allowed with the current
 * selection.
 */
export function editorSyncScope(
	c: ContentEditorController,
	isDisabled: boolean,
	isFocused: boolean
) {
	if (!c.view) {
		return;
	}

	// In this case, we don't want anything to be available.
	if (isDisabled) {
		c.capabilities = new ContentEditorScopeCapabilities();
		return;
	}

	const {
		contextCapabilities,
		view: {
			state,
			state: {
				selection: { $from },
			},
		},
	} = c;
	const cursorIndex = $from.index();
	const node = editorGetSelectedNode(c);
	const parent = node && editorGetParentNode(c, node);
	const emptySelection = state.selection.empty;

	// TODO: Can we just do this once and then cache?
	const emojiNodeType = state.schema.nodes.gjEmoji;

	/**
	 * Whether or not our current scope can be marked.
	 */
	const canBeMarked =
		!emptySelection &&
		(node?.type.name === 'text' || node?.type.name === 'paragraph') &&
		parent != null &&
		parent.type.spec.marks !== '';

	const textControls = isFocused && contextCapabilities.hasAnyText && canBeMarked;

	c.capabilities = new ContentEditorScopeCapabilities({
		bold: textControls && contextCapabilities.textBold,
		italic: textControls && contextCapabilities.textItalic,
		strike: textControls && contextCapabilities.textStrike,
		code: textControls && contextCapabilities.textCode,
		emoji: $from.parent.canReplaceWith(cursorIndex, cursorIndex, emojiNodeType),
		gif: node?.type.name === 'paragraph' && emptySelection,
	});

	const marksForSelection = (canBeMarked && editorGetMarksForSelection(c)) || [];
	const hasMark = (markType: string) => marksForSelection.some(i => i.type.name === markType);

	c.scope = new ContentEditorScope({
		bold: hasMark('strong'),
		italic: hasMark('em'),
		strike: hasMark('strike'),
		code: hasMark('code'),
	});
}

export function editorGetSelectedNode(c: ContentEditorController) {
	if (!c.view) {
		return null;
	}

	const { state } = c.view;
	let {
		selection: { from },
	} = state;

	let node = state.doc.nodeAt(from);
	// If the selection is between nodes, make sure we select the correct one.
	if (node === null && from > 0) {
		from--;
		node = state.doc.nodeAt(from);
	}
	return node ?? null;
}

export function editorGetParentNode(c: ContentEditorController, child: Node<ContentEditorSchema>) {
	if (!c.view) {
		return null;
	}
	return _getParentNode(c.view.state.doc, child);
}

function _getParentNode(
	proposedParent: Node<ContentEditorSchema>,
	child: Node<ContentEditorSchema>
): null | Node<ContentEditorSchema> {
	for (let i = 0; i < proposedParent.childCount; i++) {
		const parentChild = proposedParent.child(i);
		if (parentChild === child) {
			return proposedParent;
		}

		const maybeParent = _getParentNode(parentChild, child);
		if (maybeParent !== null) {
			return maybeParent;
		}
	}

	return null;
}

/**
 * Returns a list of all marks applied to any node within the selection
 */
export function editorGetMarksForSelection(c: ContentEditorController) {
	const markTypes: Mark<ContentEditorSchema>[] = [];
	if (!c.view) {
		return markTypes;
	}

	const {
		state: { doc, selection },
	} = c.view;

	doc.nodesBetween(
		selection.from,
		selection.to,
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
 * Ensures that the last node in the editor doc is a specific node.
 */
export function editorEnsureEndNode(
	tr: Transaction<ContentEditorSchema>,
	nodeType: NodeType<ContentEditorSchema>
) {
	if (tr.doc.lastChild && tr.doc.lastChild.type.name !== nodeType.name) {
		const newNode = nodeType.create();
		return tr.insert(tr.doc.nodeSize - 2, newNode);
	}
	return null;
}

export function editorToggleMark(
	c: ContentEditorController,
	mark: MarkType<ContentEditorSchema>,
	attrs?: { [key: string]: any }
) {
	if (!c.view) {
		return;
	}

	// TODO: Check against capabilities before doing this?

	toggleMark(mark, attrs)(c.view.state, tr => c.view?.dispatch(tr));
}

export function editorInsertEmoji(c: ContentEditorController, emojiType: string) {
	if (!c.view || !c.capabilities.emoji) {
		return;
	}

	const {
		view,
		view: {
			state,
			state: { tr },
		},
	} = c;

	const emojiNodeType = state.schema.nodes.gjEmoji;
	tr.replaceSelectionWith(emojiNodeType.create({ type: emojiType }));

	view.focus();
	view.dispatch(tr);
}

export function editorInsertGif(c: ContentEditorController, gif: SearchResult) {
	if (!c.view || !c.capabilities.gif) {
		return;
	}

	const {
		view,
		view: {
			state,
			state: { tr, selection },
		},
	} = c;

	const newNode = state.schema.nodes.gif.create({
		id: gif.id,
		width: gif.width,
		height: gif.height,
		service: 'tenor',
		media: { webm: gif.webm, mp4: gif.mp4, preview: gif.preview },
		url: gif.url,
	});

	tr.replaceWith(selection.from - 1, selection.to + 1, newNode);

	const resolvedCursorPos = tr.doc.resolve(selection.from);
	const resolvedSelection = Selection.near(resolvedCursorPos);
	tr.setSelection(resolvedSelection);
	editorEnsureEndNode(tr, state.schema.nodes.paragraph);

	view.focus();
	view.dispatch(tr);
}
