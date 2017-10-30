import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import View from '!view!./games.html';

import { GameListingContainer } from '../../../../../components/game/listing/listing-container-service';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import {
	GameFilteringContainer,
	checkGameFilteringRoute,
} from '../../../../../components/game/filtering/container';
import { AppGameListing } from '../../../../../components/game/listing/listing';
import { AppGameGrid } from '../../../../../components/game/grid/grid';
import { LocationRedirect } from '../../../../../../lib/gj-lib-client/utils/router';
import { Ads } from '../../../../../../lib/gj-lib-client/components/ad/ads.service';
import { HalloweenMonster } from '../../../../../../lib/gj-lib-client/components/halloween-monster/halloween-monster.model';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../lib/gj-lib-client/components/route/route-component';

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

	@RouteResolve({ cache: true })
	async routeResolve(this: undefined, route: VueRouter.Route) {
		const location = checkGameFilteringRoute(route);
		if (location) {
			return new LocationRedirect(location);
		}

		const filtering = new GameFilteringContainer(route);
		return Api.sendRequest(
			`/web/discover/channels/games/${route.params.channel}?` + filtering.getQueryString(route)
		);
	}

	routed(fromCache: boolean) {
		if (!this.listing || !this.filtering) {
			this.filtering = new GameFilteringContainer(this.$route);
			this.listing = new GameListingContainer(this.filtering);
		}

		this.listing.setAdTargeting(this.$route);
		this.listing.processPayload(this.$route, this.$payload);

		Ads.setAdUnit('gamesdir');

		if (!fromCache && this.$payload.halloweenMonster) {
			HalloweenMonster.add(new HalloweenMonster(this.$payload.halloweenMonster));
		}
	}
}
