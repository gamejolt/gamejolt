import { baseKeymap } from 'prosemirror-commands';
import { history } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { Plugin } from 'prosemirror-state';
import AppContentEditor from '../content-editor';
import { ContentEditorSchema } from '../schemas/content-editor-schema';
import { getContentEditorKeymap } from './commands/keymap';
import { createInputRules } from './input-rules/input-rules';
import UpdateAutolinkPlugin from './update-autolinks-plugin';
import { UpdateIncrementerPlugin } from './update-incrementer-plugin';
import { UpdateIsEmptyPlugin } from './update-is-empty-plugin';

type KeyedPlugin = {
	key: string;
} & Plugin;

export function createPlugins(editor: AppContentEditor, schema: ContentEditorSchema): Plugin[] {
	// This is used to update any children with the new view.
	// We don't want to watch the view/state objects because they are too heavy.
	// So instead, this increments a counter every time the state changes
	const incrementerPlugin = new Plugin<ContentEditorSchema>({
		view(editorView) {
			return new UpdateIncrementerPlugin(editorView, editor);
		},
	});
	const isEmptyPlugin = new Plugin<ContentEditorSchema>({
		view(_editorView) {
			return new UpdateIsEmptyPlugin(editor);
		},
	});

	// Additional keyboard bindings
	const ourKeymap = getContentEditorKeymap(editor, schema);

	const plugins = [
		keymap(ourKeymap),
		keymap(baseKeymap),
		history(),
		incrementerPlugin,
		isEmptyPlugin,
		new UpdateAutolinkPlugin(editor.contextCapabilities),
		createInputRules(editor),
	] as KeyedPlugin[];

	// Each plugin needs to have a unique key.
	for (let i = 0; i < plugins.length; i++) {
		if (plugins[i].key.startsWith('plugin$')) {
			plugins[i].key = 'plugin$' + i.toString();
		}
	}

	return plugins;
}
