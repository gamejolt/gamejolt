import View from '!view!./app.html';
import { date } from 'game-jolt-frontend-lib/vue/filters/date';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Connection } from '../lib/gj-lib-client/components/connection/connection-service';
import { AppErrorPage } from '../lib/gj-lib-client/components/error/page/page';
import { AppGrowls } from '../lib/gj-lib-client/components/growls/growls';
import { AppLoadingBar } from '../lib/gj-lib-client/components/loading/bar/bar';
import { AppModals } from '../lib/gj-lib-client/components/modal/modals';
import { AppTheme } from '../lib/gj-lib-client/components/theme/theme';
import { loadCurrentLanguage } from '../utils/translations';
import { AppCookieBanner } from '../_common/cookie/banner/banner';

let components: any = {
	AppTheme,
	AppLoadingBar,
	AppGrowls,
	AppErrorPage,
	AppCookieBanner,
	AppModals,
};

if (GJ_IS_CLIENT) {
	components = {
		...components,
		...require('../_common/client/base/base'),
	};
}

@View
@Component({
	components,
	filters: {
		date,
	},
})
export class App extends Vue {
	readonly Connection = Connection;

	mounted() {
		loadCurrentLanguage(this);
	}
}
