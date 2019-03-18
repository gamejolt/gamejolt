import { Connection } from 'game-jolt-frontend-lib/components/connection/connection-service';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import AppErrorPage from 'game-jolt-frontend-lib/components/error/page/page.vue';
import AppGrowls from 'game-jolt-frontend-lib/components/growls/growls.vue';
import AppLoadingBar from 'game-jolt-frontend-lib/components/loading/bar/bar.vue';
import AppModals from 'game-jolt-frontend-lib/components/modal/modals.vue';
import { AppTheme } from 'game-jolt-frontend-lib/components/theme/theme';
import AppUserBar from 'game-jolt-frontend-lib/components/user/user-bar/user-bar.vue';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import { date } from 'game-jolt-frontend-lib/vue/filters/date';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { loadCurrentLanguage } from '../utils/translations';
import * as _ClientHistoryNavigatorMod from '../_common/client/history-navigator/history-navigator.service';
import AppCookieBanner from '../_common/cookie/banner/banner.vue';
import { Store } from './store/index';

let components: any = {
	AppTheme,
	AppErrorPage,
	AppLoadingBar,
	AppGrowls,
	AppModals,
	AppUserBar,
	AppJolticon,
	AppCookieBanner,
};

let ClientHistoryNavigatorMod: typeof _ClientHistoryNavigatorMod | undefined;
if (GJ_IS_CLIENT) {
	ClientHistoryNavigatorMod = require('../_common/client/history-navigator/history-navigator.service');
	components = {
		...components,
		...require('../_common/client/base/base.vue'),
	};
}

@Component({
	components,
	filters: {
		date,
	},
})
export default class App extends Vue {
	@State app!: Store['app'];

	curDate = new Date();

	readonly Connection = Connection;
	readonly Environment = Environment;

	mounted() {
		// Will load the user in asynchronously so that the user-bar in the
		// shell will get loaded with a user.
		User.touch();

		loadCurrentLanguage(this);
	}

	navigateBack() {
		if (ClientHistoryNavigatorMod) {
			ClientHistoryNavigatorMod.ClientHistoryNavigator.back();
		}
	}
}
