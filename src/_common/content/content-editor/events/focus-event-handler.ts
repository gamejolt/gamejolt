import { EditorView } from 'prosemirror-view';
import { ContentEditorController } from '../content-editor-controller';

export function focusEventHandler(c: ContentEditorController) {
	return function (_view: EditorView, _e: Event) {
		// When the editor gets focus, always close the controls.
		c.controlsCollapsed = true;
		return false;
	};
}
