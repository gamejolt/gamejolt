import { Device } from 'game-jolt-frontend-lib/components/device/device.service';
import { AppState, AppStore } from 'game-jolt-frontend-lib/vue/services/app/app-store';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import AppClientIntro from '../../client/intro/intro.vue';
import { AppClientSystemProgress } from '../../client/system-progress/system-progress';


@Component({
	components: {
		AppClientIntro,
		AppClientSystemProgress,
	},
})
export default class AppShellClient extends Vue {
	@AppState userBootstrapped!: AppStore['userBootstrapped'];

	isShowingIntro = true;

	get os() {
		return Device.os();
	}
}
