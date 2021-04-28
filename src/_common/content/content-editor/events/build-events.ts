import { Node } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { imageMimeTypes } from '../../../../utils/image';
import { ContextCapabilities } from '../../content-context';
import AppContentEditorTS from '../content-editor';
import { ContentEditorController, editorUploadImageFile } from '../content-editor-controller';
import { ContentEditorService } from '../content-editor.service';
import { dropEventHandler } from './drop-event-handler';
import { focusEventHandler } from './focus-event-handler';
import { keydownEventHandler } from './keydown-event-handler';
import { pasteEventHandler } from './paste-event-handler';

type EventHandlers = {
	[name: string]: (view: EditorView<any>, event: Event) => boolean;
};

export default function buildEvents(editor: AppContentEditorTS): EventHandlers {
	const handlers = {} as EventHandlers;
	const c = editor.controller;

	if (c.contextCapabilities.media) {
		handlers.paste = pasteEventHandler(c);
		handlers.drop = dropEventHandler(c);
	}
	handlers.focus = focusEventHandler(editor);
	handlers.keydown = keydownEventHandler(editor);

	return handlers;
}

export function canPasteImages(state: EditorState, capabilities: ContextCapabilities) {
	// Image uploads are not allowed in code blocks.
	const selectedNode = ContentEditorService.getSelectedNode(state);
	if (selectedNode instanceof Node) {
		if (capabilities.codeBlock) {
			const isInCodeBlock =
				ContentEditorService.isContainedInNode(
					state,
					selectedNode,
					state.schema.nodes.codeBlock
				) instanceof Node;
			if (isInCodeBlock) {
				return false;
			}
		}
	}
	return true;
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
