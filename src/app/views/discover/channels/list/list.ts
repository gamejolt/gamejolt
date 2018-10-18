import View from '!view!./list.html';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { AppChannelThumbnail } from '../../../../components/channel/thumbnail/thumbnail';
import { AppPageHeader } from '../../../../components/page-header/page-header';

@View
@Component({
	name: 'RouteDiscoverChannelsList',
	components: {
		AppPageHeader,
		AppChannelThumbnail,
	},
})
@RouteResolver({
	deps: {},
	resolver: () => Api.sendRequest('/web/discover/channels'),
})
export default class RouteDiscoverChannelsList extends BaseRouteComponent {
	channels: any[] = [];

	get routeTitle() {
		return this.$gettext('Top Channels');
	}

	routeCreated() {
		Meta.description = 'Find and discover indie games around specific interests.';
	}

	routeResolved($payload: any) {
		this.channels = $payload.channels;
	}
}
