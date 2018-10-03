import View from '!view!./devlogs.html';
import { Ads } from 'game-jolt-frontend-lib/components/ad/ads.service';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../lib/gj-lib-client/components/route/route-component';
import { GameFilteringContainer } from '../../../../../components/game/filtering/container';
import { AppGameGrid } from '../../../../../components/game/grid/grid';
import { AppGameListing } from '../../../../../components/game/listing/listing';
import { GameListingContainer } from '../../../../../components/game/listing/listing-container-service';

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
	routeResolve(this: undefined, route: Route) {
		const filtering = new GameFilteringContainer(route);
		return Api.sendRequest(
			`/web/discover/channels/devlogs/${route.params.channel}?` +
				filtering.getQueryString(route)
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
