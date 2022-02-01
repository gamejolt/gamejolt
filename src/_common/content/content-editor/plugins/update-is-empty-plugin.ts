import type { EditorState } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';
import { editorUpdateIsEmpty, type ContentEditorController } from '../content-editor-controller';
import type { ContentEditorSchema } from '../schemas/content-editor-schema';

export class UpdateIsEmptyPlugin {
	constructor(private readonly c: ContentEditorController) {}

	update(
		{ state }: EditorView<ContentEditorSchema>,
		_lastState: EditorState<ContentEditorSchema> | null
	) {
		editorUpdateIsEmpty(this.c, state);
	}
}
