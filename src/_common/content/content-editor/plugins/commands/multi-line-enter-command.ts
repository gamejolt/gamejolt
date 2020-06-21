import { EditorState } from 'prosemirror-state';
import AppContentEditor from '../../content-editor';
import { ContentEditorSchema } from '../../schemas/content-editor-schema';
import { PMDispatch } from './keymap';

export function multiLineEnter(editor: AppContentEditor) {
	return function(state: EditorState<ContentEditorSchema>, dispatch: PMDispatch) {
		if (!editor.singleLineMode) {
			editor.emitSubmit();
			return true;
		} else {
			// Insert new paragraph at cursor position.
			dispatch(state.tr.replaceSelectionWith(state.schema.nodes.paragraph.create()));
		}

		return false;
	};
}
