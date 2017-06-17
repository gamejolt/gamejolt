import Vue from 'vue';
import VueRouter from 'vue-router';
import { Component, Prop } from 'vue-property-decorator';

import { BeforeRouteEnter } from '../../../../../../lib/gj-lib-client/utils/router';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import { Meta } from '../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { AppDiscoverGamesViewOverviewGame } from './_game/game';
import { PartnerReferral } from '../../../../../../lib/gj-lib-client/components/partner-referral/partner-referral-service';
import { AppDiscoverGamesViewOverviewDevlog } from './_devlog/devlog';
import { RouteMutation, RouteStore, RouteState } from '../view.state';

@Component({
	components: {
		AppDiscoverGamesViewOverviewGame,
		AppDiscoverGamesViewOverviewDevlog,
	},
})
export default class RouteDiscoverGamesViewOverview extends Vue {
	@Prop() id: string;

	@RouteState game: RouteStore['game'];

	@RouteMutation bootstrapFeed: RouteStore['bootstrapFeed'];
	@RouteMutation processOverviewPayload: RouteStore['processOverviewPayload'];

	@BeforeRouteEnter({ lazy: true, cache: true })
	beforeRoute(route: VueRouter.Route) {
		// If we have a tracked partner "ref" in the URL, we want to pass that along
		// when gathering the payload.
		let apiOverviewUrl = '/web/discover/games/overview/' + route.params.id;

		const ref = PartnerReferral.getReferrer(
			'Game',
			parseInt(route.params.id, 10),
		);
		if (ref) {
			apiOverviewUrl += '?ref=' + ref;
		}

		return Api.sendRequest(apiOverviewUrl);
	}

	created() {
		// Try pulling feed from cache.
		this.bootstrapFeed();
	}

	async routed() {
		const dev = this.game.developer;
		Meta.title = `${this.game.title} by ${dev.display_name} (@${dev.username})`;
		Meta.description = this.$payload.metaDescription;
		Meta.fb = this.$payload.fb;
		Meta.twitter = this.$payload.twitter;

		if (this.$payload.microdata) {
			Meta.microdata = this.$payload.microdata;
		}

		this.processOverviewPayload(this.$payload);
	}

	render(h: Vue.CreateElement) {
		return h(
			this.game._is_devlog
				? AppDiscoverGamesViewOverviewDevlog
				: AppDiscoverGamesViewOverviewGame,
		);
	}
}
