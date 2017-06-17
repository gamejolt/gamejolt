import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./devlogs.html';

import { GameListingContainer } from '../../../../../components/game/listing/listing-container-service';
import { BeforeRouteEnter } from '../../../../../../lib/gj-lib-client/utils/router';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import { GameFilteringContainer } from '../../../../../components/game/filtering/container';
import { AppGameListing } from '../../../../../components/game/listing/listing';
import { AppGameGrid } from '../../../../../components/game/grid/grid';

@View
@Component({
	components: {
		AppGameListing,
		AppGameGrid,
	},
})
export default class RouteDiscoverChannelsViewDevlogs extends Vue {
	@Prop() shouldShowAds: boolean;

	// Devlogs don't have filters.
	listing: GameListingContainer | null = null;

	@BeforeRouteEnter({ cache: true })
	routeEnter(this: undefined, route: VueRouter.Route) {
		const filtering = new GameFilteringContainer();
		return Api.sendRequest(
			`/web/discover/channels/devlogs/${route.params.channel}?` +
				filtering.getQueryString(route)
		);
	}

	routed() {
		this.listing = new GameListingContainer();
		this.listing.processPayload(this.$route, this.$payload);
	}
}
