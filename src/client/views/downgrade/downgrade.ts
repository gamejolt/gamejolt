import Axios from 'axios';
import { Options } from 'vue-property-decorator';
import { Device } from '../../../_common/device/device.service';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';

const ManifestUrl = 'https://d.gamejolt.net/data/client/manifest-2.json';

@Options({
	name: 'RouteDowngrade',
})
@RouteResolver({
	resolver: () => Axios.get(ManifestUrl),
})
export default class RouteDowngrade extends BaseRouteComponent {
	downloadUrl = '';

	readonly platform = Device.os();

	routeResolved(payload: any) {
		let platform = '';
		if (this.platform === 'windows') {
			platform = 'win32';
		} else if (this.platform === 'linux') {
			platform = 'linux64';
		} else if (this.platform === 'mac') {
			platform = 'osx64';
		}

		if (payload.data[platform] && payload.data[platform].url) {
			this.downloadUrl = payload.data[platform].url;
		}
	}
}
