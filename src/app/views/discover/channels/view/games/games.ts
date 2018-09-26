import View from '!view!./games.html';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { Ads } from '../../../../../../lib/gj-lib-client/components/ad/ads.service';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../lib/gj-lib-client/components/route/route-component';
import { LocationRedirect } from '../../../../../../lib/gj-lib-client/utils/router';
import {
	checkGameFilteringRoute,
	GameFilteringContainer,
} from '../../../../../components/game/filtering/container';
import { AppGameGrid } from '../../../../../components/game/grid/grid';
import { AppGameListing } from '../../../../../components/game/listing/listing';
import { GameListingContainer } from '../../../../../components/game/listing/listing-container-service';

@View
@Component({
	name: 'RouteDiscoverChannelsViewGames',
	components: {
		AppGameListing,
		AppGameGrid,
	},
})
export default class RouteDiscoverChannelsViewGames extends BaseRouteComponent {
	filtering: GameFilteringContainer | null = null;
	listing: GameListingContainer | null = null;

	@RouteResolve({ cache: true, reloadOnQueryChange: true })
	async routeResolve(this: undefined, route: Route) {
		const location = checkGameFilteringRoute(route);
		if (location) {
			return new LocationRedirect(location);
		}

		const filtering = new GameFilteringContainer(route);
		return Api.sendRequest(
			`/web/discover/channels/games/${route.params.channel}?` +
				filtering.getQueryString(route)
		);
	}

	routed($payload: any) {
		if (!this.listing || !this.filtering) {
			this.filtering = new GameFilteringContainer(this.$route);
			this.listing = new GameListingContainer(this.filtering);
		}

		this.listing.setAdTargeting(this.$route);
		this.listing.processPayload(this.$route, $payload);

		Ads.setAdUnit('gamesdir');
	}
}
