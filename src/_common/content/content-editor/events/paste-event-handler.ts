import { EditorView } from 'prosemirror-view';
import { ContextCapabilities } from '../../content-context';
import { ContentEditorService } from '../content-editor.service';
import { canPasteImages } from './build-events';

/**
 * Handles pasting direct image data from e.g. Paint, GIMP or web browsers
 */
export function pasteEventHandler(capabilities: ContextCapabilities) {
	return function(view: EditorView, e: Event) {
		if (
			!ContentEditorService.isDisabled(view) &&
			e.type === 'paste' &&
			canPasteImages(view.state, capabilities)
		) {
			const pasteEvent = e as ClipboardEvent;
			if (!!pasteEvent.clipboardData && !!pasteEvent.clipboardData.items) {
				return ContentEditorService.handleImageUploads(
					view,
					pasteEvent.clipboardData.items
				);
			}
		}
		return false;
	};
}
