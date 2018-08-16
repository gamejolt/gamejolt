import View from '!view!./app.html';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';

import { Environment } from '../lib/gj-lib-client/components/environment/environment.service';
import { AppErrorPage } from '../lib/gj-lib-client/components/error/page/page';
import { AppJolticon } from '../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { date } from '../lib/gj-lib-client/vue/filters/date';
import { Store } from './store/index';
import { Connection } from '../lib/gj-lib-client/components/connection/connection-service';
import { AppTheme } from '../lib/gj-lib-client/components/theme/theme';

let components: any = {
	AppTheme,
	AppErrorPage,
	AppJolticon,
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
	@State app!: Store['app'];

	curDate = new Date();

	readonly Connection = Connection;
	readonly Environment = Environment;
}
