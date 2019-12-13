import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { loadCurrentLanguage } from '../utils/translations';
import AppErrorPage from '../_common/error/page/page.vue';
import AppCommonShell from '../_common/shell/shell.vue';
import AppSiteEditor from './components/site-editor/site-editor.vue';

@Component({
	components: {
		AppCommonShell,
		AppErrorPage,
		AppSiteEditor,
	},
})
export default class App extends Vue {
	mounted() {
		loadCurrentLanguage(this);
	}
}
