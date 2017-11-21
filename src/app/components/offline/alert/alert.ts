import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import View from '!view!./alert.html?style=./alert.styl';

import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { Connection } from '../../../../lib/gj-lib-client/components/connection/connection-service';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';

@View
@Component({
	components: {
		AppJolticon,
	},
})
export class AppOfflineAlert extends Vue {
	shouldShow = false;
	forceHidden = false;

	Connection = makeObservableService(Connection);

	@Watch('Connection.isOffline')
	onlineChange(isOffline: boolean) {
		this.shouldShow = isOffline;

		// Always reset the force hidden state when we switch to offline.
		if (isOffline) {
			this.forceHidden = false;
		}
	}
}
