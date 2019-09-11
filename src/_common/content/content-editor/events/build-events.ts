import { Node } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { ContextCapabilities } from '../../content-context';
import AppContentEditorTS from '../content-editor';
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

	if (editor.capabilities.media) {
		handlers.paste = pasteEventHandler(editor.capabilities);
		handlers.drop = dropEventHandler(editor.capabilities);
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
