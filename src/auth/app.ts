import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./app.html';

import { AppGrowls } from '../lib/gj-lib-client/components/growls/growls';
import { makeObservableService } from '../lib/gj-lib-client/utils/vue';
import { Connection } from '../lib/gj-lib-client/components/connection/connection-service';
import { AppLoadingBar } from '../lib/gj-lib-client/components/loading/bar/bar';
import { AppErrorPage } from '../lib/gj-lib-client/components/error/page/page';
import { loadCurrentLanguage } from '../utils/translations';

@View
@Component({
	components: {
		AppLoadingBar,
		AppGrowls,
		AppErrorPage,
	},
})
export class App extends Vue {
	Connection = makeObservableService(Connection);

	mounted() {
		loadCurrentLanguage(this);
	}
}
