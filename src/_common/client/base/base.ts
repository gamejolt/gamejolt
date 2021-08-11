import { Options, Vue } from 'vue-property-decorator';
import { Device } from '../../device/device.service';
import { AppClientMacAppMenu } from '../mac-app-menu/mac-app-menu';
import { AppClientTray } from '../tray/tray';

@Options({
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
