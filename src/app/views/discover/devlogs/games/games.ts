import View from '!view!./games.html';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { Ads } from '../../../../../lib/gj-lib-client/components/ad/ads.service';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { GameFilteringContainer } from '../../../../components/game/filtering/container';
import { AppGameGrid } from '../../../../components/game/grid/grid';
import { AppGameListing } from '../../../../components/game/listing/listing';
import { GameListingContainer } from '../../../../components/game/listing/listing-container-service';

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

	@RouteResolve({
		cache: true,
	})
	routeResolve(this: undefined, route: Route) {
		const filteringContainer = new GameFilteringContainer(route);
		return Api.sendRequest(
			'/web/discover/devlogs/games?' + filteringContainer.getQueryString(route)
		);
	}

	routed($payload: any) {
		this.listing = new GameListingContainer();
		this.listing.setAdTargeting(this.$route, 'devlogs');
		this.listing.processPayload(this.$route, $payload);
	}

	routeDestroy() {
		Ads.releasePageSettings();
	}
}
