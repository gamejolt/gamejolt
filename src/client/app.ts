if (GJ_IS_CLIENT) {
	require('../_common/client/updater/updater');
}

import View from '!view!./app.html';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { AppErrorPage } from '../lib/gj-lib-client/components/error/page/page';

@View
@Component({
	components: {
		AppErrorPage,
	},
})
export class App extends Vue {}
