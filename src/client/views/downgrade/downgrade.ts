import View from '!view!./downgrade.html';
import Axios from 'axios';
import { Component } from 'vue-property-decorator';
import { Device } from '../../../lib/gj-lib-client/components/device/device.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../lib/gj-lib-client/components/route/route-component';

const ManifestUrl = 'https://d.gamejolt.net/data/client/manifest-2.json';

@View
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
