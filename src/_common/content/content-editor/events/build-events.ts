import { EditorView } from 'prosemirror-view';

import { ContentEditorController, editorUploadImageFile } from '~common/content/content-editor/content-editor-controller';
import { dropEventHandler } from '~common/content/content-editor/events/drop-event-handler';
import { focusEventHandler } from '~common/content/content-editor/events/focus-event-handler';
import { keydownEventHandler } from '~common/content/content-editor/events/keydown-event-handler';
import { pasteEventHandler } from '~common/content/content-editor/events/paste-event-handler';
import { imageMimeTypes } from '~utils/image';

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
