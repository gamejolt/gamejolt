import { Node, Slice } from 'prosemirror-model';
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
 * This command creates a new paragraph instead of splitting the heading when pressing Enter at the end of a heading node.
 */
export function splitHeading(c: ContentEditorController) {
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
