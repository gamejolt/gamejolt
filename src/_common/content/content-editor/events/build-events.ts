import { EditorView } from 'prosemirror-view';
import { imageMimeTypes } from '../../../../utils/image';
import { ContentEditorController, editorUploadImageFile } from '../content-editor-controller';
import { dropEventHandler } from './drop-event-handler';
import { focusEventHandler } from './focus-event-handler';
import { keydownEventHandler } from './keydown-event-handler';
import { pasteEventHandler } from './paste-event-handler';

type EventHandlers = {
	[name: string]: (view: EditorView<any>, event: Event) => boolean;
};

export default function buildEditorEvents(c: ContentEditorController): EventHandlers {
	const handlers = {} as EventHandlers;

	if (c.contextCapabilities.media) {
		handlers.paste = pasteEventHandler(c);
		handlers.drop = dropEventHandler(c);
	}
	handlers.focus = focusEventHandler(c);
	handlers.keydown = keydownEventHandler(c);

	return handlers;
}

export function handleImageUploads(c: ContentEditorController, items: DataTransferItemList) {
	let handled = false;

	for (let i = 0; i < items.length; i++) {
		const transferItem = items[i];

		if (
			transferItem.kind === 'file' &&
			imageMimeTypes.includes(transferItem.type.toLowerCase())
		) {
			const result = editorUploadImageFile(c, transferItem.getAsFile());
			if (result) {
				handled = true;
			}
		}
	}
	return handled;
}
