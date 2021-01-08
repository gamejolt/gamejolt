import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppContentEditorTS from '../_common/content/content-editor/content-editor';
import {
	editorDispatchMark,
	editorInsertEmoji,
} from '../_common/content/content-editor/content-editor-controller';
import AppContentEditor from '../_common/content/content-editor/content-editor.vue';
import { AppTheme } from '../_common/theme/theme';
import { Store } from './store';

interface EditorCommand {
	action: 'bold' | 'italic' | 'strikethrough' | 'emoji';
	data?: any;
}

@Component({
	components: {
		AppTheme,
		AppContentEditor,
	},
})
export default class App extends Vue {
	@State app!: Store['app'];

	content = '';

	$refs!: {
		editor: AppContentEditorTS;
	};

	mounted() {
		(window as any).gjEditor = {
			run: (commandJson: string) => {
				const c = this.$refs.editor.controller;
				if (!c.view) {
					return;
				}

				const command = JSON.parse(commandJson) as EditorCommand;

				switch (command.action) {
					case 'bold':
						return editorDispatchMark(c, c.view.state.schema.marks.strong);

					case 'italic':
						return editorDispatchMark(c, c.view.state.schema.marks.em);

					case 'strikethrough':
						return editorDispatchMark(c, c.view.state.schema.marks.strike);

					case 'emoji':
						return editorInsertEmoji(c, command.data!.type);
				}
			},
		};
	}

	onUpdate(content: string) {
		this.content = content;
	}
}
