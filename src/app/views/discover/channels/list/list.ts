import { Component } from 'vue-property-decorator';
import View from '!view!./list.html';

import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { AppPageHeader } from '../../../../components/page-header/page-header';
import { AppChannelThumbnail } from '../../../../components/channel/thumbnail/thumbnail';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDiscoverChannelsList',
	components: {
		AppPageHeader,
		AppChannelThumbnail,
	},
})
export default class RouteDiscoverChannelsList extends BaseRouteComponent {
	channels: any[] = [];

	@RouteResolve()
	routeResolve() {
		return Api.sendRequest('/web/discover/channels');
	}

	get routeTitle() {
		return this.$gettext('Top Channels');
	}

	routeInit() {
		Meta.description = 'Find and discover indie games around specific interests.';
	}

	routed($payload: any) {
		this.channels = $payload.channels;
	}
}
