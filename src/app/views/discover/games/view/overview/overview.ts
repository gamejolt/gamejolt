import { CreateElement } from 'vue';
import { Route } from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';

import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import { Meta } from '../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { AppDiscoverGamesViewOverviewGame } from './_game/game';
import { PartnerReferral } from '../../../../../../lib/gj-lib-client/components/partner-referral/partner-referral-service';
import { AppDiscoverGamesViewOverviewDevlog } from './_devlog/devlog';
import { RouteMutation, RouteStore, RouteState } from '../view.store';
import { HistoryTick } from '../../../../../../lib/gj-lib-client/components/history-tick/history-tick-service';
import {
	RouteResolve,
	BaseRouteComponent,
} from '../../../../../../lib/gj-lib-client/components/route/route-component';

@Component({
	name: 'RouteDiscoverGamesViewOverview',
	components: {
		AppDiscoverGamesViewOverviewGame,
		AppDiscoverGamesViewOverviewDevlog,
	},
})
export default class RouteDiscoverGamesViewOverview extends BaseRouteComponent {
	@Prop() id: string;

	@RouteState game: RouteStore['game'];

	@RouteMutation bootstrapFeed: RouteStore['bootstrapFeed'];
	@RouteMutation processOverviewPayload: RouteStore['processOverviewPayload'];

	@RouteResolve({ lazy: true, cache: true })
	routeResolve(this: undefined, route: Route) {
		const gameId = parseInt(route.params.id, 10);
		HistoryTick.sendBeacon('game-view', gameId, {
			sourceResource: 'Game',
			sourceResourceId: gameId,
		});

		// If we have a tracked partner "ref" in the URL, we want to pass that along
		// when gathering the payload.
		let apiOverviewUrl = '/web/discover/games/overview/' + route.params.id;

		const ref = PartnerReferral.getReferrer('Game', parseInt(route.params.id, 10));
		if (ref) {
			apiOverviewUrl += '?ref=' + ref;
		}

		return Api.sendRequest(apiOverviewUrl);
	}

	get routeTitle() {
		if (this.game) {
			const dev = this.game.developer;
			return `${this.game.title} by ${dev.display_name} (@${dev.username})`;
		}
		return null;
	}

	routeInit() {
		// Try pulling feed from cache.
		this.bootstrapFeed();
	}

	async routed($payload: any) {
		Meta.description = $payload.metaDescription;
		Meta.fb = $payload.fb;
		Meta.twitter = $payload.twitter;

		if ($payload.microdata) {
			Meta.microdata = $payload.microdata;
		}

		this.processOverviewPayload($payload);
	}

	render(h: CreateElement) {
		return h(
			this.game._is_devlog ? AppDiscoverGamesViewOverviewDevlog : AppDiscoverGamesViewOverviewGame
		);
	}
}
