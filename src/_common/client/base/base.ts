import { Device } from 'game-jolt-frontend-lib/components/device/device.service';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { AppClientMacAppMenu } from '../mac-app-menu/mac-app-menu';
import { AppClientTray } from '../tray/tray';

/**
 * Includes the base components needed by all sections for client.
 */

@Component({
	components: {
		AppClientTray,
		AppClientMacAppMenu,
	},
})
export default class AppClientBase extends Vue {
	get os() {
		return Device.os();
	}
}
