import AppErrorPage from 'game-jolt-frontend-lib/components/error/page/page.vue';
import AppGrowls from 'game-jolt-frontend-lib/components/growls/growls.vue';
import AppLoadingBar from 'game-jolt-frontend-lib/components/loading/bar/bar.vue';
import { AppTheme } from 'game-jolt-frontend-lib/components/theme/theme';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppCookieBanner from '../_common/cookie/banner/banner.vue';

@Component({
	components: {
		AppTheme,
		AppLoadingBar,
		AppGrowls,
		AppErrorPage,
		AppCookieBanner,
	},
})
export default class App extends Vue {}
