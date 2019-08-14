import AppErrorPage from '../_common/error/page/page.vue';
import AppGrowls from '../_common/growls/growls.vue';
import AppLoadingBar from '../_common/loading/bar/bar.vue';
import { AppTheme } from '../_common/theme/theme';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { loadCurrentLanguage } from '../utils/translations';
import AppSiteEditor from './components/site-editor/site-editor.vue';

@Component({
	components: {
		AppTheme,
		AppErrorPage,
		AppLoadingBar,
		AppGrowls,
		AppSiteEditor,
	},
})
export default class App extends Vue {
	mounted() {
		loadCurrentLanguage(this);
	}
}
