import { Route } from 'vue-router';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { GameFilteringContainer } from '../filtering/container';
import { Ads } from '../../../../lib/gj-lib-client/components/ad/ads.service';

export class GameListingContainer {
	isBootstrapped = false;
	games: any[] = [];
	gamesCount = 0;
	perPage = 10;
	currentPage = 1;
	section = 'hot';

	constructor(public filteringContainer?: GameFilteringContainer) {}

	processPayload(route: Route, payload: any) {
		this.isBootstrapped = true;
		this.games = Game.populate(payload.games);
		this.gamesCount = payload.gamesCount;
		this.perPage = payload.perPage;

		this.currentPage = route.query.page ? parseInt(route.query.page, 10) : 1;
		this.section = route.params.section || 'hot';
	}

	setAdTargeting(route: Route) {
		const genre = route.params.category || undefined;
		const channel = route.params.channel || undefined;

		let mat: string | undefined;
		let paid: string | undefined;
		if (this.filteringContainer) {
			const priceFilter = this.filteringContainer.getFilter('price');
			mat = this.filteringContainer.getFilter('maturity');
			paid = priceFilter ? (priceFilter !== 'free' ? 'y' : 'n') : undefined;
		}

		Ads.globalTargeting = {
			mat,
			genre,
			channel,
			paid,
		};
	}
}
