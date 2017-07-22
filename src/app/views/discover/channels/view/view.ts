import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./view.html';

import { ChannelsViewHelper } from '../channels-view-helper';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { Meta } from '../../../../../lib/gj-lib-client/components/meta/meta-service';
import { Channels } from '../../../../components/channel/channels-service';
import { AppPageHeader } from '../../../../components/page-header/page-header';
import { number } from '../../../../../lib/gj-lib-client/vue/filters/number';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	components: {
		AppPageHeader,
	},
})
export default class RouteDiscoverChannelsView extends BaseRouteComponent {
	channel = '';

	number = number;
	Meta = Meta;
	Channels = Channels;

	@RouteResolve({ cache: true, lazy: true, cacheTag: 'view' })
	routeResolve(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest('/web/discover/channels/' + route.params.channel);
	}

	routeInit() {
		this.channel = this.$route.params.channel;
		ChannelsViewHelper.setDefaultMetaData(this.$route.params.channel);
	}

	routed() {
		// Overwrite channel from server so we can decide how it displays in the
		// end.
		this.channel = this.$payload.channel;
	}
}
