import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./games.html';

import { AppGameListing } from '../../../../components/game/listing/listing';
import { AppGameGrid } from '../../../../components/game/grid/grid';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { GameListingContainer } from '../../../../components/game/listing/listing-container-service';
import { GameFilteringContainer } from '../../../../components/game/filtering/container';
import { Ads } from '../../../../../lib/gj-lib-client/components/ad/ads.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDiscoverDevlogsGames',
	components: {
		AppGameListing,
		AppGameGrid,
	},
})
export default class RouteDiscoverDevlogsGames extends BaseRouteComponent {
	listing: GameListingContainer | null = null;

	@RouteResolve({ cache: true })
	routeResolve(this: undefined, route: VueRouter.Route) {
		const filteringContainer = new GameFilteringContainer(route);
		return Api.sendRequest(
			'/web/discover/devlogs/games?' + filteringContainer.getQueryString(route)
		);
	}

	routed() {
		this.listing = new GameListingContainer();
		this.listing.setAdTargeting(this.$route);
		this.listing.processPayload(this.$route, this.$payload);

		Ads.setAdUnit('devlogs');
	}
}
