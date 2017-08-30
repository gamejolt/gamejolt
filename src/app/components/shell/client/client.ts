import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./client.html';

import { AppClientTray } from '../../client/tray/tray';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { Device } from '../../../../lib/gj-lib-client/components/device/device.service';
import { AppClientMacAppMenu } from '../../client/mac-app-menu/mac-app-menu';

@View
@Component({
	components: {
		AppClientTray,
		AppClientMacAppMenu,
	},
})
export class AppClient extends Vue {
	readonly Device = makeObservableService(Device);
}
