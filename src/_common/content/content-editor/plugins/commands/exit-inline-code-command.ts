import { EditorState } from 'prosemirror-state';
import {
	ContentEditorController,
	editorGetParentNode,
	editorGetSelectedNode,
	editorIsNodeCode,
	editorResolveNodePosition,
} from '../../content-editor-controller';
import { ContentEditorSchema } from '../../schemas/content-editor-schema';
import { PMDispatch } from './keymap';

/**
 * Command to exit inline code at the end of a block element.
 * This makes sure there is an easy way to enter non-code text at the end of a block without having to
 * manually remove the code mark from the last character(s) in the code text.
 */
export function exitInlineCode(c: ContentEditorController, spacePressed: boolean) {
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
