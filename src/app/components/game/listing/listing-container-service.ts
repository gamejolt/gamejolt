import VueRouter from 'vue-router';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { GameFilteringContainer } from '../filtering/container';

export class GameListingContainer
{
	isBootstrapped = false;
	games: any[] = [];
	gamesCount = 0;
	perPage = 10;
	currentPage = 1;
	section = 'hot';

	constructor( public filteringContainer?: GameFilteringContainer )
	{
	}

	processPayload( route: VueRouter.Route, payload: any )
	{
		this.isBootstrapped = true;
		this.games = Game.populate( payload.games );
		this.gamesCount = payload.gamesCount;
		this.perPage = payload.perPage;

		this.currentPage = route.query.page ? parseInt( route.query.page, 10 ) : 1;
		this.section = route.params.section || 'hot';
	}
}
