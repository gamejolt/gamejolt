import View from '!view!./client.html';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

import { Device } from '../../../../lib/gj-lib-client/components/device/device.service';
import { AppState, AppStore } from '../../../../lib/gj-lib-client/vue/services/app/app-store';
import { AppClientIntro } from '../../client/intro/intro';
import { AppClientSystemProgress } from '../../client/system-progress/system-progress';

@View
@Component({
	components: {
		AppClientIntro,
		AppClientSystemProgress,
	},
})
export class AppShellClient extends Vue {
	@AppState userBootstrapped: AppStore['userBootstrapped'];

	isShowingIntro = true;

	get os() {
		return Device.os();
	}
}
