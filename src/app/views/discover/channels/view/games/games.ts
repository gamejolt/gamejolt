import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./games.html';

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
	name: 'RouteDiscoverChannelsViewGames',
	components: {
		AppGameListing,
		AppGameGrid,
	},
})
export default class RouteDiscoverChannelsViewGames extends BaseRouteComponent {
	filtering: GameFilteringContainer | null = null;
	listing: GameListingContainer | null = null;

	// TODO(rewrite): Still gotta work on this
	@RouteResolve({ cache: true })
	async routeResolve(this: undefined, route: VueRouter.Route) {
		const filtering = new GameFilteringContainer();

		// If initialization changed the URL, then we don't want to do the API call.
		// This prevents a double API call from going out.
		if (!filtering.init(route)) {
			return undefined;
		}

		return Api.sendRequest(
			`/web/discover/channels/games/${route.params.channel}?` + filtering.getQueryString(route)
		);
	}

	routed() {
		if (!this.listing || !this.filtering) {
			this.filtering = new GameFilteringContainer();
			this.filtering.init(this.$route);

			this.listing = new GameListingContainer(this.filtering);
		}

		this.listing.processPayload(this.$route, this.$payload);
	}
}
