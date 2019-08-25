import { toggleMark } from 'prosemirror-commands';
import { EditorState } from 'prosemirror-state';
import { ContextCapabilities } from '../../../content-context';
import { ContentEditorService } from '../../content-editor.service';
import { ContentEditorLinkModal } from '../../modals/link/link-modal.service';
import { ContentEditorSchema } from '../../schemas/content-editor-schema';
import { PMDispatch } from './keymap';

export function showLinkModal(capabilities: ContextCapabilities, schema: ContentEditorSchema) {
	return async function(
		state: EditorState<ContentEditorSchema>,
		dispatch: PMDispatch | undefined
	) {
		if (!capabilities.textLink || !capabilities.customLink) {
			return false;
		}
		if (ContentEditorService.checkCurrentNodeIsCode(state)) {
			return false;
		}

		const selectionMarks = ContentEditorService.getSelectionMarks(state);
		if (selectionMarks.some(m => m.type.name === 'link')) {
			toggleMark(schema.marks.link)(state, dispatch);
		} else {
			const selectedText = ContentEditorService.getSelectedText(state);
			const result = await ContentEditorLinkModal.show(selectedText);
			if (result) {
				toggleMark(schema.marks.link, {
					href: result.href,
					title: result.title,
				})(state, dispatch);
			}
		}
		return true;
	};
}
