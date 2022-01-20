import type { EditorState } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';
import { ContentEditorController, editorUpdateContent } from '../content-editor-controller';
import type { ContentEditorSchema } from '../schemas/content-editor-schema';

export class UpdateIncrementerPlugin {
	constructor(private readonly c: ContentEditorController) {}

	update(
		{ state }: EditorView<ContentEditorSchema>,
		lastState: EditorState<ContentEditorSchema> | null
	) {
		if (lastState && lastState.doc.eq(state.doc) && lastState.selection.eq(state.selection)) {
			return;
		}
		// If anything in the editor changes (content or selection), make sure
		// we increment, so we can for example reposition controls.
		++this.c.stateCounter;

		// Hide the control after an input was performed. Check
		// detect-mention-suggestion plugin for more info.
		if (this.c.canShowMentionSuggestions > 0) {
			this.c.canShowMentionSuggestions--;
		}

		if (!lastState || !lastState.doc.eq(state.doc)) {
			editorUpdateContent(this.c, state);
		}
	}
}
