import { Options, Vue } from 'vue-property-decorator';
import { getDeviceOS } from '../../../../_common/device/device.service';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import AppClientIntro from '../../client/intro/intro.vue';
import { AppClientSystemProgress } from '../../client/system-progress/system-progress';

@Options({
	components: {
		AppClientIntro,
		AppClientSystemProgress,
	},
})
export default class AppShellClient extends Vue {
	@AppState userBootstrapped!: AppStore['userBootstrapped'];

	isShowingIntro = true;

	get os() {
		return getDeviceOS();
	}
}
