import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./app.html';

import { AppGrowls } from '../lib/gj-lib-client/components/growls/growls';
import { Connection } from '../lib/gj-lib-client/components/connection/connection-service';
import { AppLoadingBar } from '../lib/gj-lib-client/components/loading/bar/bar';
import { AppErrorPage } from '../lib/gj-lib-client/components/error/page/page';
import { loadCurrentLanguage } from '../utils/translations';
import { AppTheme } from '../lib/gj-lib-client/components/theme/theme';

let components: any = {
	AppTheme,
	AppLoadingBar,
	AppGrowls,
	AppErrorPage,
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
})
export class App extends Vue {
	readonly Connection = Connection;

	mounted() {
		loadCurrentLanguage(this);
	}
}
