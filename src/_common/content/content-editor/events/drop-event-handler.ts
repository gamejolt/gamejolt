import { EditorView } from 'prosemirror-view';
import { ContentEditorController } from '../content-editor-controller';
import { ContentEditorService } from '../content-editor.service';
import { handleImageUploads } from './build-events';

/**
 * Handles dropping image files into the content editor
 */
export function dropEventHandler(c: ContentEditorController) {
	return function (view: EditorView, e: Event) {
		if (!ContentEditorService.isDisabled(view) && e.type === 'drop' && c.capabilities.media) {
			const dropEvent = e as DragEvent;
			if (!!dropEvent.dataTransfer && dropEvent.dataTransfer.items) {
				return handleImageUploads(c, dropEvent.dataTransfer.items);
			}
		}
		return false;
	};
}
