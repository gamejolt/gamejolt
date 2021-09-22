import { Options, Vue } from 'vue-property-decorator';
import AppErrorPage from '../_common/error/page/page.vue';
import AppCommonShell from '../_common/shell/shell.vue';
import { loadCurrentLanguage } from '../_common/translate/translate.service';
import AppSiteEditor from './components/site-editor/site-editor.vue';

@Options({
	components: {
		AppCommonShell,
		AppErrorPage,
		AppSiteEditor,
	},
})
export default class App extends Vue {
	mounted() {
		loadCurrentLanguage();
	}
}
