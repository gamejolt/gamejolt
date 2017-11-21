import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import View from '!view!./client.html';

import { AppClientTray } from '../../client/tray/tray';
import { AppClientMacAppMenu } from '../../client/mac-app-menu/mac-app-menu';
import { AppClientHidpi } from '../../client/hidpi/hidpi';
import { Device } from '../../../../lib/gj-lib-client/components/device/device.service';
import { AppClientSystemProgress } from '../../client/system-progress/system-progress';
import { AppClientIntro } from '../../client/intro/intro';
import { AppClientMigrator } from '../../client/migrator/migrator';
import { AppState, AppStore } from '../../../../lib/gj-lib-client/vue/services/app/app-store';

@View
@Component({
	components: {
		AppClientIntro,
		AppClientMigrator,
		AppClientHidpi,
		AppClientTray,
		AppClientMacAppMenu,
		AppClientSystemProgress,
	},
})
export class AppClient extends Vue {
	@AppState userBootstrapped: AppStore['userBootstrapped'];

	isShowingIntro = true;

	get os() {
		return Device.os();
	}
}
