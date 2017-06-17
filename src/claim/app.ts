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

@View
@Component({
	components: {
		AppErrorPage,
		AppLoadingBar,
		AppGrowls,
		AppModals,
		AppUserBar,
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
	}
}
