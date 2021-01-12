import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { ContentEditorAppAdapter } from '../_common/content/content-editor/app-adapter';
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

	content = '';
	adapter!: ContentEditorAppAdapter;

	$refs!: {
		editor: AppContentEditorTS;
	};

	mounted() {
		this.adapter = new ContentEditorAppAdapter(this.$refs.editor.controller);
	}
}
