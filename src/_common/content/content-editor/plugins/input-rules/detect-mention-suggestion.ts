import { InputRule } from 'prosemirror-inputrules';
import { EditorState } from 'prosemirror-state';
import AppContentEditor from '../../content-editor';
import { ContentEditorService } from '../../content-editor.service';
import { ContentEditorSchema } from '../../schemas/content-editor-schema';

export function detectMentionSuggestionRule(editor: AppContentEditor) {
	return new InputRule(
		/@([\w_-]+)$/i,
		(
			state: EditorState<ContentEditorSchema>,
			_match: string[],
			_start: number,
			_end: number
		) => {
			// We don't want to insert lists inside code text.

			if (ContentEditorService.checkCurrentNodeIsCode(state)) {
				return null;
			}

			editor.canShowMentionSuggestions = 2;

			return null;
		}
	);
}
