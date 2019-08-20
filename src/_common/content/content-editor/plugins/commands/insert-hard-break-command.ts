import { EditorState } from 'prosemirror-state';
import { ContentEditorSchema } from '../../schemas/content-editor-schema';
import { PMDispatch } from './keymap';

export function insertHardBreak(state: EditorState<ContentEditorSchema>, dispatch: PMDispatch) {
	if (!dispatch) {
		return false;
	}

	dispatch(state.tr.replaceSelectionWith(state.schema.nodes.hardBreak.create()).scrollIntoView());
	return true;
}
