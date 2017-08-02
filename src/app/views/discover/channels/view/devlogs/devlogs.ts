import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./devlogs.html';

import { GameListingContainer } from '../../../../../components/game/listing/listing-container-service';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import { GameFilteringContainer } from '../../../../../components/game/filtering/container';
import { AppGameListing } from '../../../../../components/game/listing/listing';
import { AppGameGrid } from '../../../../../components/game/grid/grid';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDiscoverChannelsViewDevlogs',
	components: {
		AppGameListing,
		AppGameGrid,
	},
})
export default class RouteDiscoverChannelsViewDevlogs extends BaseRouteComponent {
	// Devlogs don't have filters.
	listing: GameListingContainer | null = null;

	@RouteResolve({ cache: true })
	routeResolve(this: undefined, route: VueRouter.Route) {
		const filtering = new GameFilteringContainer();
		return Api.sendRequest(
			`/web/discover/channels/devlogs/${route.params.channel}?` + filtering.getQueryString(route)
		);
	}

	routed() {
		this.listing = new GameListingContainer();
		this.listing.processPayload(this.$route, this.$payload);
	}
}
