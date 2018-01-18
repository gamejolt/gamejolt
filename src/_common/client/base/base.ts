import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./base.html';

import { AppClientTray } from '../tray/tray';
import { AppClientMacAppMenu } from '../mac-app-menu/mac-app-menu';
import { Device } from '../../../lib/gj-lib-client/components/device/device.service';

/**
 * Includes the base components needed by all sections for client.
 */
@View
@Component({
	components: {
		AppClientTray,
		AppClientMacAppMenu,
	},
})
export class AppClientBase extends Vue {
	get os() {
		return Device.os();
	}
}
