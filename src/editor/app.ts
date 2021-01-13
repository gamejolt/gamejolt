import { parse } from 'qs';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import {
	ContentEditorAppAdapter,
	ContentEditorAppAdapterMessage,
} from '../_common/content/content-editor/app-adapter';
import AppContentEditorTS from '../_common/content/content-editor/content-editor';
import AppContentEditor from '../_common/content/content-editor/content-editor.vue';
import { AppTheme } from '../_common/theme/theme';
import { Store } from './store';

@Component({
	components: {
		AppTheme,
		AppContentEditor,
	},
})
export default class App extends Vue {
	@State app!: Store['app'];

	context = '';
	content = '';
	adapter!: ContentEditorAppAdapter;

	$refs!: {
		editor: AppContentEditorTS;
	};

	created() {
		const query = parse(window.location.search.substring(1));
		if (!query['context'] || typeof query['context'] !== 'string') {
			throw new Error('Invalid context');
		}

		this.context = query['context'];
	}

	mounted() {
		this.adapter = new ContentEditorAppAdapter(this.$refs.editor.controller);
	}

	onContentChange(content: string) {
		const msg = ContentEditorAppAdapterMessage.syncContent(content);
		this.adapter.send(msg);
	}
}
