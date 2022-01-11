import { Options, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { ContentEditorAppAdapter } from '../_common/content/content-editor/app-adapter';
import AppContentEditorTS from '../_common/content/content-editor/content-editor';
import AppContentEditor from '../_common/content/content-editor/content-editor.vue';
import { AppTheme } from '../_common/theme/theme';
import { useThemeStore } from '../_common/theme/theme.store';
import { Store } from './store';

@Options({
	components: {
		AppTheme,
		AppContentEditor,
	},
})
export default class App extends Vue {
	@State app!: Store['app'];

	declare adapter: ContentEditorAppAdapter;

	declare $refs: {
		editor: AppContentEditorTS;
	};

	created() {
		this.adapter = new ContentEditorAppAdapter(() => this.$refs.editor.controller, {
			// Have to do it this way since setup() unwraps shallowly.
			// TODO(vue3): check this
			themeStore: useThemeStore(),
		});
	}
}
