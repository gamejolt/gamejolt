import { EditorView } from 'prosemirror-view';
import AppContentEditorTS from '../content-editor';

export function keydownEventHandler(editor: AppContentEditorTS) {
	return function(_view: EditorView, e: Event) {
		if (e instanceof KeyboardEvent) {
			if (e.key === 'Enter') {
				// If the mention suggestion popover is visible, prevent the default action of the enter key event.
				// This is so no new line gets inserted, and the popover can handle the enter event itself to insert a mention.
				if (editor.canShowMentionSuggestions > 0) {
					e.preventDefault();
					return true;
				}
			}
		}
		return false;
	};
}
