import AppErrorPage from 'game-jolt-frontend-lib/components/error/page/page.vue';
import AppGrowls from 'game-jolt-frontend-lib/components/growls/growls.vue';
import AppLoadingBar from 'game-jolt-frontend-lib/components/loading/bar/bar.vue';
import { AppTheme } from 'game-jolt-frontend-lib/components/theme/theme';
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
