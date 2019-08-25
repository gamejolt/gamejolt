import { chainCommands, exitCode, toggleMark } from 'prosemirror-commands';
import { redo, undo } from 'prosemirror-history';
import { sinkListItem, splitListItem } from 'prosemirror-schema-list';
import { EditorState, Transaction } from 'prosemirror-state';
import AppContentEditor from '../../content-editor';
import { ContentListService } from '../../content-list.service';
import { ContentEditorSchema } from '../../schemas/content-editor-schema';
import { exitCodeStart } from './exit-code-start-command';
import { insertHardBreak } from './insert-hard-break-command';
import { showLinkModal } from './link-modal-command';
import { splitHeading } from './split-heading-command';

export type PMDispatch = (tr: Transaction<ContentEditorSchema>) => void;
export type PMKeymapCommand = (
	state: EditorState<ContentEditorSchema>,
	tr: PMDispatch | undefined
) => boolean;

export function getContentEditorKeymap(editor: AppContentEditor, schema: ContentEditorSchema) {
	const isMac = typeof navigator != 'undefined' ? /Mac/.test(navigator.platform) : false;

	const keymap = {
		'Mod-z': undo,
		'Shift-Mod-z': redo,
		'Mod-b': toggleMark(schema.marks.strong),
		'Mod-i': toggleMark(schema.marks.em),
		'Mod-`': toggleMark(schema.marks.code),
		'Shift-Enter': chainCommands(exitCodeStart(editor.capabilities), exitCode, insertHardBreak),
		// open emoji panel
		'Mod-e': () => {
			if (editor.capabilities.emoji) {
				editor.showEmojiPanel();
			}
			return true;
		},
		// Add/remove link
		'Mod-k': showLinkModal(editor.capabilities, schema),
	} as { [k: string]: any };

	const enterCommands = [] as PMKeymapCommand[];

	if (editor.capabilities.heading) {
		enterCommands.push(splitHeading());
	}

	if (editor.capabilities.list) {
		enterCommands.push(splitListItem(schema.nodes.listItem));
		keymap['Shift-Tab'] = ContentListService.liftListItem(schema.nodes.listItem);
		keymap['Tab'] = sinkListItem(schema.nodes.listItem);
	}

	keymap['Enter'] = chainCommands(...enterCommands);

	if (!isMac) {
		keymap['Mod-y'] = redo;
	}

	return keymap;
}
