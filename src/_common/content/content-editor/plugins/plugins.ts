import { baseKeymap } from 'prosemirror-commands';
import { history } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { Plugin } from 'prosemirror-state';
import { ContentEditorController } from '../content-editor-controller';
import { ContentEditorSchema } from '../schemas/content-editor-schema';
import { createInputRules } from './input-rules';
import { getContentEditorKeymap } from './keymap';
import UpdateAutolinkPlugin from './update-autolinks-plugin';
import { UpdateIncrementerPlugin } from './update-incrementer-plugin';
import { UpdateIsEmptyPlugin } from './update-is-empty-plugin';

type KeyedPlugin = {
	key: string;
} & Plugin;

export function createEditorPlugins(
	c: ContentEditorController
): Plugin<any, ContentEditorSchema>[] {
	// This is used to update any children with the new view.
	// We don't want to watch the view/state objects because they are too heavy.
	// So instead, this increments a counter every time the state changes
	const incrementerPlugin = new Plugin<any, ContentEditorSchema>({
		view(_editorView) {
			return new UpdateIncrementerPlugin(c);
		},
	});
	const isEmptyPlugin = new Plugin<any, ContentEditorSchema>({
		view(_editorView) {
			return new UpdateIsEmptyPlugin(c);
		},
	});

	// Additional keyboard bindings
	const ourKeymap = getContentEditorKeymap(c);

	const plugins = [
		keymap(ourKeymap),
		keymap(baseKeymap),
		history(),
		incrementerPlugin,
		isEmptyPlugin,
		new UpdateAutolinkPlugin(c),
		createInputRules(c),
	] as KeyedPlugin[];

	// Each plugin needs to have a unique key.
	for (let i = 0; i < plugins.length; i++) {
		if (plugins[i].key.startsWith('plugin$')) {
			plugins[i].key = 'plugin$' + i.toString();
		}
	}

	return plugins;
}
