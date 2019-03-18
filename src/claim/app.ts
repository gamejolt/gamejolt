import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import AppErrorPage from 'game-jolt-frontend-lib/components/error/page/page.vue';
import AppGrowls from 'game-jolt-frontend-lib/components/growls/growls.vue';
import AppLoadingBar from 'game-jolt-frontend-lib/components/loading/bar/bar.vue';
import AppModals from 'game-jolt-frontend-lib/components/modal/modals.vue';
import { AppTheme } from 'game-jolt-frontend-lib/components/theme/theme';
import AppUserBar from 'game-jolt-frontend-lib/components/user/user-bar/user-bar.vue';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { date } from 'game-jolt-frontend-lib/vue/filters/date';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { loadCurrentLanguage } from '../utils/translations';
import AppCookieBanner from '../_common/cookie/banner/banner.vue';
import { Store } from './store/index';

@Component({
	components: {
		AppTheme,
		AppErrorPage,
		AppLoadingBar,
		AppGrowls,
		AppModals,
		AppUserBar,
		AppCookieBanner,
	},
	filters: {
		date,
	},
})
export default class App extends Vue {
	@State app!: Store['app'];

	curDate = new Date();

	readonly Environment = Environment;

	mounted() {
		// Will load the user in asynchronously so that the user-bar in the
		// shell will get loaded with a user.
		User.touch();

		loadCurrentLanguage(this);
	}
}
