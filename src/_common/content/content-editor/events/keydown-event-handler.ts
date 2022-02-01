import { EditorView } from 'prosemirror-view';
import { ContentEditorController } from '../content-editor-controller';

export function keydownEventHandler(c: ContentEditorController) {
	return function (_view: EditorView, e: Event) {
		if (e instanceof KeyboardEvent) {
			if (e.key === 'Enter') {
				// If the mention suggestion popover is visible and users are selectable, prevent the default action of the enter key event.
				// This is so no new line gets inserted, and the popover can handle the enter event itself to insert a mention.
				if (c.capabilities.hasMentionControls && c.mentionUserCount > 0) {
					e.preventDefault();
					return true;
				}
			}
		}
		return false;
	};
}
