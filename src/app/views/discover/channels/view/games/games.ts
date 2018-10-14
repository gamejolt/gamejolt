import View from '!view!./games.html';
import { Component } from 'vue-property-decorator';
import { Ads } from '../../../../../../lib/gj-lib-client/components/ad/ads.service';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolver,
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
@RouteResolver({
	cache: true,
	async resolver({ route }) {
		const location = checkGameFilteringRoute(route);
		if (location) {
			return new LocationRedirect(location);
		}

		const filtering = new GameFilteringContainer(route);
		return Api.sendRequest(
			`/web/discover/channels/games/${route.params.channel}?` +
				filtering.getQueryString(route)
		);
	},
})
export default class RouteDiscoverChannelsViewGames extends BaseRouteComponent {
	filtering: GameFilteringContainer | null = null;
	listing: GameListingContainer | null = null;

	routeResolved($payload: any) {
		if (!this.listing || !this.filtering) {
			this.filtering = new GameFilteringContainer(this.$route);
			this.listing = new GameListingContainer(this.filtering);
		}

		this.listing.setAdTargeting(this.$route, 'gamesdir');
		this.listing.processPayload(this.$route, $payload);
	}

	routeDestroyed() {
		Ads.releasePageSettings();
	}
}
