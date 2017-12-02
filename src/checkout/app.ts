import View from '!view!./app.html';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';

import * as _ClientHistoryNavigatorMod from '../_common/client/history-navigator/history-navigator.service';
import { AppErrorPage } from '../lib/gj-lib-client/components/error/page/page';
import { AppGrowls } from '../lib/gj-lib-client/components/growls/growls';
import { AppLoadingBar } from '../lib/gj-lib-client/components/loading/bar/bar';
import { AppModals } from '../lib/gj-lib-client/components/modal/modals';
import { AppUserBar } from '../lib/gj-lib-client/components/user/user-bar/user-bar';
import { User } from '../lib/gj-lib-client/components/user/user.model';
import { AppJolticon } from '../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { date } from '../lib/gj-lib-client/vue/filters/date';
import { loadCurrentLanguage } from '../utils/translations';
import { Store } from './store/index';

let ClientHistoryNavigatorMod: typeof _ClientHistoryNavigatorMod | undefined;
if (GJ_IS_CLIENT) {
	ClientHistoryNavigatorMod = require('../_common/client/history-navigator/history-navigator.service');
}

@View
@Component({
	components: {
		AppErrorPage,
		AppLoadingBar,
		AppGrowls,
		AppModals,
		AppUserBar,
		AppJolticon,
	},
	filters: {
		date,
	},
})
export class App extends Vue {
	@State app: Store['app'];

	curDate = new Date();

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
