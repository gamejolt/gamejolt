import Axios from 'axios';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./client.html?style=./client.styl';

import { Meta } from '../../../../lib/gj-lib-client/components/meta/meta-service';
import { Device } from '../../../../lib/gj-lib-client/components/device/device.service';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';
import { FiresidePost } from '../../../../lib/gj-lib-client/components/fireside/post/post-model';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTrackEvent } from '../../../../lib/gj-lib-client/components/analytics/track-event.directive.vue';
import { AppScrollTo } from '../../../../lib/gj-lib-client/components/scroll/to/to.directive';
import { AppFiresidePostList } from '../../../components/fireside/post/list/list';
import { AppFiresidePostThumbnail } from '../../../components/fireside/post/thumbnail/thumbnail';
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
		AppFiresidePostList,
		AppFiresidePostThumbnail,
	},
	directives: {
		AppTrackEvent,
		AppScrollTo,
	},
})
export default class RouteLandingClient extends BaseRouteComponent {
	platform = Device.os();
	downloadSrc = '';
	firesidePosts: FiresidePost[] = [];

	Screen = makeObservableService(Screen);

	@RouteResolve({ cache: true, lazy: true })
	routeResolve() {
		return Api.sendRequest('/web/client');
	}

	routeInit() {
		Meta.title = 'Game Jolt Client';
	}

	routed() {
		this.firesidePosts = FiresidePost.populate(this.$payload.firesidePosts);
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

		const response = await Axios.get(ManifestUrl);

		if (!response.data[platform] || !response.data[platform].url) {
			Growls.error(`Couldn't find a download for your platform!`);
			return;
		}

		this.downloadSrc = response.data[platform].url;
	}
}
