import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./games.html';

import { AppGameListing } from '../../../../components/game/listing/listing';
import { AppGameGrid } from '../../../../components/game/grid/grid';
import { RouteResolve } from '../../../../../lib/gj-lib-client/utils/router';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { GameListingContainer } from '../../../../components/game/listing/listing-container-service';
import { GameFilteringContainer } from '../../../../components/game/filtering/container';

@View
@Component({
	components: {
		AppGameListing,
		AppGameGrid,
	},
})
export default class RouteDiscoverDevlogsGames extends Vue {
	listing: GameListingContainer | null = null;

	@RouteResolve({ cache: true })
	routeResolve(this: undefined, route: VueRouter.Route) {
		const filteringContainer = new GameFilteringContainer();
		return Api.sendRequest(
			'/web/discover/devlogs/games?' + filteringContainer.getQueryString(route)
		);
	}

	routed() {
		this.listing = new GameListingContainer();
		this.listing.processPayload(this.$route, this.$payload);
	}
}
