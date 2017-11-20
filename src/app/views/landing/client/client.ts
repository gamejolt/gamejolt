import Axios from 'axios';
import { Component } from 'vue-property-decorator';
import View from '!view!./client.html?style=./client.styl';

import { Device } from '../../../../lib/gj-lib-client/components/device/device.service';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppScrollTo } from '../../../../lib/gj-lib-client/components/scroll/to/to.directive';
import { HistoryTick } from '../../../../lib/gj-lib-client/components/history-tick/history-tick-service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../lib/gj-lib-client/components/route/route-component';

const ManifestUrl = 'https://d.gamejolt.net/data/client/manifest-2.json';

@View
@Component({
	name: 'RouteLandingClient',
	components: {
		AppJolticon,
	},
	directives: {
		AppTrackEvent,
		AppScrollTo,
	},
})
export default class RouteLandingClient extends BaseRouteComponent {
	platform = Device.os();
	downloadSrc = '';

	Screen = makeObservableService(Screen);

	@RouteResolve({ cache: true, lazy: true })
	routeResolve() {
		return Api.sendRequest('/web/client');
	}

	get routeTitle() {
		return 'Game Jolt Client';
	}

	async download(platform: string) {
		if (platform === 'windows') {
			platform = 'win32';
		} else if (platform === 'linux') {
			platform = 'linux64';
		} else if (platform === 'mac') {
			platform = 'osx64';
		}

		// This will reset the iframe since it removes it when there is no download src.
		this.downloadSrc = '';

		HistoryTick.sendBeacon('client-download');
		const response = await Axios.get(ManifestUrl);

		if (!response.data[platform] || !response.data[platform].url) {
			Growls.error(`Couldn't find a download for your platform!`);
			return;
		}

		this.downloadSrc = response.data[platform].url;
	}
}
