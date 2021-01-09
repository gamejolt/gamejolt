import { chainCommands, exitCode, toggleMark } from 'prosemirror-commands';
import { redo, undo } from 'prosemirror-history';
import { sinkListItem, splitListItem } from 'prosemirror-schema-list';
import { EditorState, Transaction } from 'prosemirror-state';
import { isMac } from '../../../../../utils/utils';
import AppContentEditor from '../../content-editor';
import { ContentListService } from '../../content-list.service';
import { ContentEditorSchema } from '../../schemas/content-editor-schema';
import { exitCodeStart } from './exit-code-start-command';
import { exitInlineCode } from './exit-inline-code-command';
import { insertHardBreak } from './insert-hard-break-command';
import { showLinkModal } from './link-modal-command';
import { multiLineEnter } from './multi-line-enter-command';
import { singleLineEnter } from './single-line-enter-command';
import { splitHeading } from './split-heading-command';

export type PMDispatch = (tr: Transaction<ContentEditorSchema>) => void;
export type PMKeymapCommand = (
	state: EditorState<ContentEditorSchema>,
	tr: PMDispatch | undefined
) => boolean;

export function getContentEditorKeymap(editor: AppContentEditor, schema: ContentEditorSchema) {
	const capabilities = editor.contextCapabilities;
	const keymap = {
		'Mod-z': undo,
		'Shift-Mod-z': redo,
		'Mod-b': toggleMark(schema.marks.strong),
		'Mod-i': toggleMark(schema.marks.em),
		'Mod-`': toggleMark(schema.marks.code),
		'Shift-Enter': chainCommands(exitCodeStart(capabilities), exitCode, insertHardBreak),
		'Mod-Enter': multiLineEnter(editor),
		// open emoji panel
		'Mod-e': () => {
			if (capabilities.emoji) {
				editor.showEmojiPanel();
			}
			return true;
		},
		// Add/remove link
		'Mod-k': showLinkModal(capabilities, schema),
		ArrowRight: exitInlineCode(capabilities, schema, false),
		Space: exitInlineCode(capabilities, schema, true),
	} as { [k: string]: any };

	const enterCommands = [] as PMKeymapCommand[];
	enterCommands.push(singleLineEnter(editor));

	if (capabilities.heading) {
		enterCommands.push(splitHeading());
	}

	if (capabilities.list) {
		enterCommands.push(splitListItem(schema.nodes.listItem));
		keymap['Shift-Tab'] = ContentListService.liftListItem(schema.nodes.listItem);
		keymap['Tab'] = sinkListItem(schema.nodes.listItem);
	}

	keymap['Enter'] = chainCommands(...enterCommands);

	if (!isMac()) {
		keymap['Mod-y'] = redo;
	}

	return keymap;
}
