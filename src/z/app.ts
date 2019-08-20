import AppErrorPage from '../_common/error/page/page.vue';
import AppGrowls from '../_common/growls/growls.vue';
import AppLoadingBar from '../_common/loading/bar/bar.vue';
import { AppTheme } from '../_common/theme/theme';
import AppUserBar from '../_common/user/user-bar/user-bar.vue';
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
