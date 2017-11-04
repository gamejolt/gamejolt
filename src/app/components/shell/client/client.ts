import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./client.html';

import { AppClientTray } from '../../client/tray/tray';
import { AppClientMacAppMenu } from '../../client/mac-app-menu/mac-app-menu';
import { AppClientHidpi } from '../../client/hidpi/hidpi';
import { Device } from '../../../../lib/gj-lib-client/components/device/device.service';
import { AppClientSystemProgress } from '../../client/system-progress/system-progress';

@View
@Component({
	components: {
		AppClientHidpi,
		AppClientTray,
		AppClientMacAppMenu,
		AppClientSystemProgress,
	},
})
export class AppClient extends Vue {
	get os() {
		return Device.os();
	}
}
