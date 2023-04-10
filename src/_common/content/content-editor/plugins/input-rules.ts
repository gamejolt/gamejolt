import { InputRule, inputRules } from 'prosemirror-inputrules';
import { EditorState, Selection } from 'prosemirror-state';
import {
	ContentEditorController,
	editorGetParentNode,
	editorGetSelectedNode,
	editorIsNodeCode,
} from '../content-editor-controller';
import { ContentEditorSchema } from '../schemas/content-editor-schema';

export const BasicMentionRegex = /@([\w_-]+)$/i;

export function createInputRules(c: ContentEditorController) {
	const rules = [] as InputRule[];
	const capabilities = c.contextCapabilities;

	if (capabilities.list) {
		rules.push(insertOrderedListRule(c));
		rules.push(insertBulletListRule(c));
	}
	if (capabilities.mention) {
		rules.push(detectMentionSuggestionRule(c));
	}

	return inputRules({ rules });
}

function insertOrderedListRule(c: ContentEditorController) {
	return new InputRule(
		/^1\. $/,
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
			const listNode = state.schema.nodes.orderedList.create({}, [listItemNode]);

			tr.replaceRangeWith(start, end, listNode);
			const resolvedCursorPos = tr.doc.resolve(state.selection.from);
			const selection = Selection.near(resolvedCursorPos);
			tr.setSelection(selection);

			return tr;
		}
	);
}

function insertBulletListRule(c: ContentEditorController) {
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

export function detectMentionSuggestionRule(c: ContentEditorController) {
	return new InputRule(
		BasicMentionRegex,
		(
			_state: EditorState<ContentEditorSchema>,
			_match: string[],
			_start: number,
			_end: number
		) => {
			// We don't want to insert mentions inside code text.
			const currentNode = editorGetSelectedNode(c);
			const parent = currentNode ? editorGetParentNode(c, currentNode) : null;
			if (currentNode && editorIsNodeCode(currentNode, parent)) {
				return null;
			}

			// This values determines whether it is currently possible to show
			// the control (it could still be hidden if the control itself
			// decides to hide due to no results, no space to show etc).
			//
			// We want to hide the mention suggestion panel again when an input
			// is performed (see update incrementer plugin). However, this
			// plugin will always execute first, then the update incrementer
			// plugin tries to hide the mention suggestions again.
			//
			// To make sure that the input that caused the mention suggestion
			// panel to be visible (that triggered this input rule) doesn't hide
			// it again right away, we use a numeric value so it needs to be
			// "hidden twice" for it to actually get hidden.
			//
			// Basically: Prevents the control to be shown and immediately
			// hidden by the update incrementer plugin.
			//
			// Note: Other parts of the editor instantly set this value to 0 to
			// be able to forcefully hide the control, while the update
			// incrementer plugin decrements the value.
			c.canShowMentionSuggestions = 2;

			return null;
		}
	);
}
