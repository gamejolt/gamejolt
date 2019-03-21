import Axios from 'axios';
import { Device } from 'game-jolt-frontend-lib/components/device/device.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';

const ManifestUrl = 'https://d.gamejolt.net/data/client/manifest-2.json';

@Component({
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
