import { chainCommands, exitCode, toggleMark } from 'prosemirror-commands';
import { redo, undo } from 'prosemirror-history';
import { Slice } from 'prosemirror-model';
import { sinkListItem, splitListItem } from 'prosemirror-schema-list';
import { EditorState, Selection, Transaction } from 'prosemirror-state';
import { isMac } from '../../../../utils/utils';
import {
	ContentEditorController,
	editorGetParentNode,
	editorGetParentNodeOfType,
	editorGetSelectedNode,
	editorGetSelectedText,
	editorIsNodeCode,
	editorLink,
	editorResolveNodePosition,
	editorShowEmojiPanel,
	editorSubmit,
	editorUnlink,
} from '../content-editor-controller';
import { ContentListService } from '../content-list.service';
import { showContentEditorLinkModal } from '../modals/link/link-modal.service';
import { ContentEditorSchema } from '../schemas/content-editor-schema';

export type PMDispatch = (tr: Transaction<ContentEditorSchema>) => void;
export type PMKeymapCommand = (
	state: EditorState<ContentEditorSchema>,
	tr: PMDispatch | undefined
) => boolean;

export function getContentEditorKeymap(c: ContentEditorController) {
	const { contextCapabilities, schema } = c;

	const keymap = {
		'Mod-z': undo,
		'Shift-Mod-z': redo,
		'Mod-b': toggleMark(schema.marks.strong),
		'Mod-i': toggleMark(schema.marks.em),
		'Mod-`': toggleMark(schema.marks.code),
		'Shift-Enter': chainCommands(exitCodeStart(c), exitCode, insertHardBreak),
		'Mod-Enter': multiLineEnter(c),
		// open emoji panel
		'Mod-e': () => {
			if (contextCapabilities.emoji) {
				editorShowEmojiPanel(c);
			}
			return true;
		},
		// Add/remove link
		'Mod-k': showLinkModal(c),
		ArrowRight: exitInlineCode(c, false),
		Space: exitInlineCode(c, true),
	} as { [k: string]: any };

	const enterCommands = [] as PMKeymapCommand[];
	enterCommands.push(singleLineEnter(c));

	if (contextCapabilities.heading) {
		enterCommands.push(splitHeading(c));
	}

	if (contextCapabilities.list) {
		enterCommands.push(splitListItem(schema.nodes.listItem));
		keymap['Shift-Tab'] = ContentListService.liftListItem(schema.nodes.listItem);
		keymap['Tab'] = sinkListItem(schema.nodes.listItem);
	}

	keymap['Enter'] = chainCommands(...enterCommands);

	if (!isMac()) {
		keymap['Mod-y'] = redo;
	}

	return keymap;
}

/**
 * Moves the cursor in front of a code block if shift enter is pressed at the
 * beginning of a code block.
 */
function exitCodeStart(c: ContentEditorController) {
	return function (state: EditorState<ContentEditorSchema>, dispatch: PMDispatch | undefined) {
		if (!dispatch || c.scope.hasSelection || !c.capabilities.codeBlock) {
			return false;
		}

		const selectedNode = editorGetSelectedNode(c);
		if (selectedNode === null) {
			return false;
		}

		const { nodes } = state.schema;
		const codeBlock = editorGetParentNodeOfType(c, selectedNode, nodes.codeBlock);

		if (codeBlock instanceof Node) {
			const codeBlockPos = editorResolveNodePosition(c, codeBlock);

			// Are we at the beginning of our code block?
			if (codeBlockPos === state.selection.from - 1) {
				const tr = state.tr;

				// Create paragraph node and insert
				const newNode = nodes.paragraph.create();
				tr.insert(codeBlockPos, newNode);

				// Resolve its position and set the selection.
				const resolvedPos = tr.doc.resolve(state.selection.from - 1);
				const selection = Selection.findFrom(resolvedPos, 1);
				if (selection instanceof Selection) {
					tr.setSelection(selection).scrollIntoView();
				}

				dispatch(tr);
				return true;
			}
		}

		return false;
	};
}

/**
 * Command to exit inline code at the end of a block element.
 *
 * This makes sure there is an easy way to enter non-code text at the end of a
 * block without having to manually remove the code mark from the last
 * character(s) in the code text.
 */
function exitInlineCode(c: ContentEditorController, spacePressed: boolean) {
	return function (state: EditorState<ContentEditorSchema>, dispatch: PMDispatch | undefined) {
		if (!dispatch || c.scope.hasSelection || !c.capabilities.code) {
			return false;
		}

		const selectedNode = editorGetSelectedNode(c);
		if (selectedNode === null) {
			return false;
		}

		// This check also ensures that the selection is at the end of the current block.
		// When the selection is at the end of a text node with the code mark, and there are text nodes after it,
		// the selection is treated as being at the start of the next one.
		if (!editorIsNodeCode(selectedNode, editorGetParentNode(c, selectedNode))) {
			return false;
		}

		// Only perform an action when the selection is at the end of the code.
		const pos = editorResolveNodePosition(c, selectedNode);
		const end = pos + selectedNode.nodeSize;
		const {
			selection: { from },
			schema: {
				marks: { code },
			},
		} = state;
		if (end !== from) {
			return false;
		}

		// When the keypress was a space, we only want to exit code when there's already a space at the end.
		if (spacePressed) {
			const text = selectedNode.text;
			if (!text || !text.endsWith(' ')) {
				return false;
			}

			// Move space at the end of the inline code outside.
			const tr = state.tr;
			tr.removeMark(from - 1, from, code);
			dispatch(tr);
		} else {
			// Insert a space at the end of the current block.
			const tr = state.tr;
			tr.insertText(' ', from);
			tr.removeMark(from, from + 1, code);
			dispatch(tr);
		}

		// Ignore original input.
		return true;
	};
}

function insertHardBreak(state: EditorState<ContentEditorSchema>, dispatch: PMDispatch) {
	if (!dispatch) {
		return false;
	}

	dispatch(state.tr.replaceSelectionWith(state.schema.nodes.hardBreak.create()).scrollIntoView());
	return true;
}

function multiLineEnter(c: ContentEditorController) {
	return function (state: EditorState<ContentEditorSchema>, dispatch: PMDispatch) {
		if (!c.singleLineMode) {
			editorSubmit(c);
			return true;
		} else {
			// Insert new paragraph at cursor position.
			dispatch(
				state.tr
					.replaceSelectionWith(state.schema.nodes.paragraph.create())
					.scrollIntoView()
			);
		}

		return false;
	};
}

function singleLineEnter(c: ContentEditorController) {
	return function () {
		if (c.singleLineMode) {
			editorSubmit(c);
			return true;
		}

		return false;
	};
}

function showLinkModal(c: ContentEditorController) {
	return async function (
		_state: EditorState<ContentEditorSchema>,
		_dispatch: PMDispatch | undefined
	) {
		const { textLink, customLink } = c.contextCapabilities;
		if (!textLink || !customLink) {
			return false;
		}

		const currentNode = editorGetSelectedNode(c);
		if (!currentNode) {
			return false;
		}

		if (editorIsNodeCode(currentNode, editorGetParentNode(c, currentNode))) {
			return false;
		}

		if (c.scope.link) {
			editorUnlink(c);
		} else {
			const selectedText = editorGetSelectedText(c);
			const result = await showContentEditorLinkModal(selectedText);
			if (result) {
				editorLink(c, result.href);
			}
		}
		return true;
	};
}

/**
 * This command creates a new paragraph instead of splitting the heading when
 * pressing Enter at the end of a heading node.
 */
function splitHeading(c: ContentEditorController) {
	return function (state: EditorState<ContentEditorSchema>, dispatch: PMDispatch | undefined) {
		if (!dispatch) {
			return false;
		}

		const selectedNode = editorGetSelectedNode(c);
		if (selectedNode === null) {
			return false;
		}

		const { nodes } = state.schema;
		const headerNode = editorGetParentNodeOfType(c, selectedNode, nodes.heading);

		if (headerNode instanceof Node) {
			const nodePos = editorResolveNodePosition(c, headerNode);
			if (nodePos !== -1) {
				const finalPosition = state.selection.to + 2;
				if (finalPosition === nodePos + headerNode.nodeSize) {
					const tr = state.tr;

					// Create paragraph node and insert
					const newNode = nodes.paragraph.create();
					tr.insert(finalPosition, newNode);
					tr.replaceSelection(Slice.empty);

					// Resolve its position and set the selection.
					const resolvedPos = tr.doc.resolve(tr.selection.to + 2);
					const selection = Selection.findFrom(resolvedPos, 1);
					if (selection instanceof Selection) {
						tr.setSelection(selection).scrollIntoView();
					}

					dispatch(tr);
					return true;
				}
			}
		}

		return false;
	};
}
