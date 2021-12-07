import { InputRule } from 'prosemirror-inputrules';
import { EditorState, Selection } from 'prosemirror-state';
import {
	ContentEditorController,
	editorGetParentNode,
	editorGetSelectedNode,
	editorIsNodeCode,
} from '../../content-editor-controller';
import { ContentEditorSchema } from '../../schemas/content-editor-schema';

export function insertBulletListRule(c: ContentEditorController) {
	return new InputRule(
		/^(?:\*|-) $/,
		(state: EditorState<ContentEditorSchema>, _match: string[], start: number, end: number) => {
			// We don't want to insert lists inside code text.
			const currentNode = editorGetSelectedNode(c);
			const parent = currentNode ? editorGetParentNode(c, currentNode) : null;
			if (currentNode && editorIsNodeCode(currentNode, parent)) {
				return null;
			}

			const tr = state.tr;

			const contentParagraph = state.schema.nodes.paragraph.create();
			const listItemNode = state.schema.nodes.listItem.create({}, [contentParagraph]);
			const listNode = state.schema.nodes.bulletList.create({}, [listItemNode]);

			tr.replaceRangeWith(start, end, listNode);
			const resolvedCursorPos = tr.doc.resolve(state.selection.from);
			const selection = Selection.near(resolvedCursorPos);
			tr.setSelection(selection);

			return tr;
		}
	);
}
