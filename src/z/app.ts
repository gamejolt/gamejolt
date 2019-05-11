import AppErrorPage from 'game-jolt-frontend-lib/components/error/page/page.vue';
import AppGrowls from 'game-jolt-frontend-lib/components/growls/growls.vue';
import AppLoadingBar from 'game-jolt-frontend-lib/components/loading/bar/bar.vue';
import { AppTheme } from 'game-jolt-frontend-lib/components/theme/theme';
import AppUserBar from 'game-jolt-frontend-lib/components/user/user-bar/user-bar.vue';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import AppCookieBanner from '../_common/cookie/banner/banner.vue';
import { Store } from './store';

@Component({
	components: {
		AppUserBar,
		AppTheme,
		AppLoadingBar,
		AppGrowls,
		AppErrorPage,
		AppCookieBanner,
	},
})
export default class App extends Vue {
	@State
	app!: Store['app'];
}
