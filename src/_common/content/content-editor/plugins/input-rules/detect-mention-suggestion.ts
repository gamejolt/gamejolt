import { InputRule } from 'prosemirror-inputrules';
import { EditorState } from 'prosemirror-state';
import AppContentEditor from '../../content-editor';
import {
	editorGetParentNode,
	editorGetSelectedNode,
	editorIsNodeCode,
} from '../../content-editor-controller';
import { ContentEditorSchema } from '../../schemas/content-editor-schema';

export const BasicMentionRegex = /@([\w_-]+)$/i;

export function detectMentionSuggestionRule(editor: AppContentEditor) {
	return new InputRule(
		BasicMentionRegex,
		(
			_state: EditorState<ContentEditorSchema>,
			_match: string[],
			_start: number,
			_end: number
		) => {
			// We don't want to insert mentions inside code text.
			const currentNode = editorGetSelectedNode(editor.controller);
			const parent = currentNode ? editorGetParentNode(editor.controller, currentNode) : null;
			if (currentNode && editorIsNodeCode(currentNode, parent)) {
				return null;
			}

			// This values determines whether it is currently possible to show the control
			// (it could still be hidden if the control itself decides to hide due to no results, no space to show etc).
			// We want to hide the mention suggestion panel again when an input is performed (see update incrementer plugin).
			// However, this plugin will always execute first, then the update incrementer plugin tries to hide the mention suggestions again.
			// To make sure that the input that caused the mention suggestion panel to be visible
			// (that triggered this input rule) doesn't hide it again
			// right away, we use a numeric value so it needs to be "hidden twice" for it to actually get hidden.
			// Basically: Prevents the control to be shown and immediately hidden by the update incrementer plugin.
			// Note: Other parts of the editor instantly set this value to 0 to be able to forcefully hide the control,
			// while the update incrementer plugin decrements the value.
			editor.canShowMentionSuggestions = 2;

			return null;
		}
	);
}
