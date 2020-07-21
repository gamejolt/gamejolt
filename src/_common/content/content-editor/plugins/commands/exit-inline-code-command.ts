import { EditorState } from 'prosemirror-state';
import { ContextCapabilities } from '../../../content-context';
import { ContentEditorService } from '../../content-editor.service';
import { ContentEditorSchema } from '../../schemas/content-editor-schema';
import { PMDispatch } from './keymap';

/**
 * Command to exit inline code at the end of a block element.
 * This makes sure there is an easy way to enter non-code text at the end of a block without having to
 * manually remove the code mark from the last character(s) in the code text.
 */
export function exitInlineCode(
	capabilities: ContextCapabilities,
	schema: ContentEditorSchema,
	spacePressed: boolean
) {
	return function(state: EditorState<ContentEditorSchema>, dispatch: PMDispatch | undefined) {
		if (!dispatch || !state.selection.empty || !capabilities.textCode) {
			return false;
		}

		// This check also ensures that the selection is at the end of the current block.
		// When the selection is at the end of a text node with the code mark, and there are text nodes after it,
		// the selection is treated as being at the start of the next one.
		if (!ContentEditorService.checkCurrentNodeIsCode(state)) {
			return false;
		}

		const selectedNode = ContentEditorService.getSelectedNode(state);
		if (selectedNode === null) {
			return false;
		}

		// Only perform an action when the selection is at the end of the code.
		const pos = ContentEditorService.findNodePosition(state, selectedNode);
		const end = pos + selectedNode.nodeSize;

		if (end !== state.selection.from) {
			return false;
		}

		// When the keypress was a space, we only want to exit code when there's already a space at the end.
		if (spacePressed) {
			const text = selectedNode.text;
			if (!text || !text.endsWith(' ')) {
				return false;
			}
		}

		// Move space at the end of the inline code outside.
		const tr = state.tr;
		tr.removeMark(state.selection.from - 1, state.selection.from, schema.marks.code);
		dispatch(tr);

		// Ignore original input.
		return true;
	};
}
