import { EditorView } from 'prosemirror-view';
import AppContentEditorTS from '../content-editor';

export function focusEventHandler(editor: AppContentEditorTS) {
	return function(_view: EditorView, _e: Event) {
		// When the editor gets focus, always close the controls.
		editor.controlsCollapsed = true;
		return false;
	};
}
