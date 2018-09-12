import View from '!view!./app.html';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';

import { Environment } from '../lib/gj-lib-client/components/environment/environment.service';
import { AppErrorPage } from '../lib/gj-lib-client/components/error/page/page';
import { AppGrowls } from '../lib/gj-lib-client/components/growls/growls';
import { AppLoadingBar } from '../lib/gj-lib-client/components/loading/bar/bar';
import { AppModals } from '../lib/gj-lib-client/components/modal/modals';
import { AppUserBar } from '../lib/gj-lib-client/components/user/user-bar/user-bar';
import { User } from '../lib/gj-lib-client/components/user/user.model';
import { date } from '../lib/gj-lib-client/vue/filters/date';
import { loadCurrentLanguage } from '../utils/translations';
import { Store } from './store/index';
import { AppTheme } from '../lib/gj-lib-client/components/theme/theme';
import { AppCookieBanner } from '../_common/cookie/banner/banner';

@View
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
export class App extends Vue {
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
