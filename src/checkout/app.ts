import Vue from 'vue';
import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./app.html';

import { AppErrorPage } from '../lib/gj-lib-client/components/error/page/page';
import { Store } from './store/index';
import { date } from '../lib/gj-lib-client/vue/filters/date';
import { AppGrowls } from '../lib/gj-lib-client/components/growls/growls';
import { AppUserBar } from '../lib/gj-lib-client/components/user/user-bar/user-bar';
import { User } from '../lib/gj-lib-client/components/user/user.model';
import { AppModals } from '../lib/gj-lib-client/components/modal/modals';
import { AppLoadingBar } from '../lib/gj-lib-client/components/loading/bar/bar';
import { makeObservableService } from '../lib/gj-lib-client/utils/vue';
import { ClientHistoryNavigator } from '../app/components/client/history-navigator/history-navigator.service';
import { AppJolticon } from '../lib/gj-lib-client/vue/components/jolticon/jolticon';

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

	// TODO(rewrite) would importing it like this still deploy the entire chunk in the web env?
	readonly HistoryNavigator = GJ_IS_CLIENT
		? makeObservableService(ClientHistoryNavigator)
		: undefined;

	mounted() {
		// Will load the user in asynchronously so that the user-bar in the
		// shell will get loaded with a user.
		User.touch();
	}
}
