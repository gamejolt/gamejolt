import { EditorView } from 'prosemirror-view';
import { ContextCapabilities } from '../../content-context';
import { ContentEditorService } from '../content-editor.service';
import { canPasteImages } from './build-events';

/**
 * Handles dropping image files into the content editor
 */
export function dropEventHandler(capabilities: ContextCapabilities) {
	return function(view: EditorView, e: Event) {
		if (
			!ContentEditorService.isDisabled(view) &&
			e.type === 'drop' &&
			canPasteImages(view.state, capabilities)
		) {
			const dropEvent = e as DragEvent;
			if (!!dropEvent.dataTransfer && dropEvent.dataTransfer.items) {
				return ContentEditorService.handleImageUploads(view, dropEvent.dataTransfer.items);
			}
		}
		return false;
	};
}
