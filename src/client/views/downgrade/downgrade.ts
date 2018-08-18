import View from '!view!./downgrade.html';
import { Component } from 'vue-property-decorator';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../lib/gj-lib-client/components/route/route-component';
import Axios from 'axios';
import { Device } from '../../../lib/gj-lib-client/components/device/device.service';

const ManifestUrl = 'https://d.gamejolt.net/data/client/manifest-2.json';

@View
@Component({
	name: 'RouteDowngrade',
})
export default class RouteDowngrade extends BaseRouteComponent {
	downloadUrl = '';

	readonly platform = Device.os();

	@RouteResolve()
	routeResolve() {
		return Axios.get(ManifestUrl);
	}

	routed(payload: any) {
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
