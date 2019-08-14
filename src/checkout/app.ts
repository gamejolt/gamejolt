import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { loadCurrentLanguage } from '../utils/translations';
import * as _ClientHistoryNavigatorMod from '../_common/client/history-navigator/history-navigator.service';
import { Connection } from '../_common/connection/connection-service';
import AppCookieBanner from '../_common/cookie/banner/banner.vue';
import { Environment } from '../_common/environment/environment.service';
import AppErrorPage from '../_common/error/page/page.vue';
import { date } from '../_common/filters/date';
import AppGrowls from '../_common/growls/growls.vue';
import AppLoadingBar from '../_common/loading/bar/bar.vue';
import AppModals from '../_common/modal/modals.vue';
import { AppTheme } from '../_common/theme/theme';
import AppUserBar from '../_common/user/user-bar/user-bar.vue';
import { User } from '../_common/user/user.model';
import { Store } from './store/index';

let components: any = {
	AppTheme,
	AppErrorPage,
	AppLoadingBar,
	AppGrowls,
	AppModals,
	AppUserBar,
	AppCookieBanner,
};

let ClientHistoryNavigatorMod: typeof _ClientHistoryNavigatorMod | undefined;
if (GJ_IS_CLIENT) {
	ClientHistoryNavigatorMod = require('../_common/client/history-navigator/history-navigator.service');
	components.AppClientBase = require('../_common/client/base/base.vue').default;
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
