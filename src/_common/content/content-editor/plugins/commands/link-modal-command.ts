import { EditorState } from 'prosemirror-state';
import {
	ContentEditorController,
	editorGetParentNode,
	editorGetSelectedNode,
	editorGetSelectedText,
	editorIsNodeCode,
	editorLink,
	editorUnlink,
} from '../../content-editor-controller';
import { ContentEditorLinkModal } from '../../modals/link/link-modal.service';
import { ContentEditorSchema } from '../../schemas/content-editor-schema';
import { PMDispatch } from './keymap';

export function showLinkModal(c: ContentEditorController) {
	return async function (
		_state: EditorState<ContentEditorSchema>,
		_dispatch: PMDispatch | undefined
	) {
		const { textLink, customLink } = c.contextCapabilities;
		if (!textLink || !customLink) {
			return false;
		}

		const currentNode = editorGetSelectedNode(c);
		if (!currentNode) {
			return false;
		}

		if (editorIsNodeCode(currentNode, editorGetParentNode(c, currentNode))) {
			return false;
		}

		if (c.scope.link) {
			editorUnlink(c);
		} else {
			const selectedText = editorGetSelectedText(c);
			const result = await ContentEditorLinkModal.show(selectedText);
			if (result) {
				editorLink(c, result.href);
			}
		}
		return true;
	};
}
