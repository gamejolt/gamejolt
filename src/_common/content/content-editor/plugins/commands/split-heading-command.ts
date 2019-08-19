import { Node, Slice } from 'prosemirror-model';
import { EditorState, Selection } from 'prosemirror-state';
import { ContentEditorService } from '../../content-editor.service';
import { ContentEditorSchema } from '../../schemas/content-editor-schema';
import { PMDispatch } from './keymap';

/**
 * This command creates a new paragraph instead of splitting the heading when pressing Enter at the end of a heading node.
 */
export function splitHeading() {
	return function(state: EditorState<ContentEditorSchema>, dispatch: PMDispatch | undefined) {
		if (!dispatch) {
			return false;
		}
		const selectedNode = ContentEditorService.getSelectedNode(state);
		if (selectedNode === null) {
			return false;
		}

		const headerNode = ContentEditorService.isContainedInNode(
			state,
			selectedNode,
			state.schema.nodes.heading
		);
		if (headerNode instanceof Node) {
			const nodePos = ContentEditorService.findNodePosition(state, headerNode);
			if (nodePos !== -1) {
				const finalPosition = state.selection.to + 2;
				if (finalPosition === nodePos + headerNode.nodeSize) {
					const tr = state.tr;

					// Create paragraph node and insert
					const newNode = state.schema.nodes.paragraph.create();
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
