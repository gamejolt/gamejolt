import { EditorView } from 'prosemirror-view';
import { ContentEditorController } from '../content-editor-controller';
import { ContentEditorService } from '../content-editor.service';
import { canPasteImages, handleImageUploads } from './build-events';

/**
 * Handles pasting direct image data from e.g. Paint, GIMP or web browsers
 */
export function pasteEventHandler(c: ContentEditorController) {
	return function(view: EditorView, e: Event) {
		if (
			!ContentEditorService.isDisabled(view) &&
			e.type === 'paste' &&
			canPasteImages(view.state, c.contextCapabilities)
		) {
			const pasteEvent = e as ClipboardEvent;
			if (!!pasteEvent.clipboardData && !!pasteEvent.clipboardData.items) {
				return handleImageUploads(c, pasteEvent.clipboardData.items);
			}
		}
		return false;
	};
}
