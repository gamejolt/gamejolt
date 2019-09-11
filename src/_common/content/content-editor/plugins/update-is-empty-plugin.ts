import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import AppContentEditor from '../content-editor';
import { ContentEditorSchema } from '../schemas/content-editor-schema';

export class UpdateIsEmptyPlugin {
	appEditor: AppContentEditor;

	constructor(appEditor: AppContentEditor) {
		this.appEditor = appEditor;
	}

	update(
		view: EditorView<ContentEditorSchema>,
		_lastState: EditorState<ContentEditorSchema> | null
	) {
		const state = view.state;

		// Set the content editor is empty state here.
		this.appEditor.updateIsEmpty(state);
	}
}
