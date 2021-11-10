import { Node } from 'prosemirror-model';
import { EditorState, Selection } from 'prosemirror-state';
import {
	ContentEditorController,
	editorGetParentNodeOfType,
	editorGetSelectedNode,
	editorResolveNodePosition,
} from '../../content-editor-controller';
import { ContentEditorSchema } from '../../schemas/content-editor-schema';
import { PMDispatch } from './keymap';

/**
 * Moves the cursor in front of a code block if shift enter is pressed at the beginning of a code block.
 */
export function exitCodeStart(c: ContentEditorController) {
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
