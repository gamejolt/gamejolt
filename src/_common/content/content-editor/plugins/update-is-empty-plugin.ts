import type { EditorState } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';

import { type ContentEditorController,editorUpdateIsEmpty } from '~common/content/content-editor/content-editor-controller';
import type { ContentEditorSchema } from '~common/content/content-editor/schemas/content-editor-schema';

export class UpdateIsEmptyPlugin {
	constructor(private readonly c: ContentEditorController) {}

	update(
		{ state }: EditorView<ContentEditorSchema>,
		_lastState: EditorState<ContentEditorSchema> | null
	) {
		editorUpdateIsEmpty(this.c, state);
	}
}
