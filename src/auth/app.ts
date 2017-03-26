import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./app.html';

import { AppGrowls } from '../lib/gj-lib-client/components/growls/growls';
import { makeObservableService } from '../lib/gj-lib-client/utils/vue';
import { Connection } from '../lib/gj-lib-client/components/connection/connection-service';

@View
@Component({
	name: 'app',
	components: {
		AppGrowls,
	},
})
export class App extends Vue
{
	Connection = makeObservableService( Connection );
}
