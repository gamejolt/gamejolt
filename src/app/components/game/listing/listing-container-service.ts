import { UIRouterGlobals } from 'angular-ui-router';
import { Game } from '../../../../lib/gj-lib-client/components/game/game.model';
import { getProvider } from '../../../../lib/gj-lib-client/utils/utils';

export class GameListingContainer
{
	games: any[];
	gamesCount = 0;
	perPage = 10;
	currentPage = 1;
	section = 'hot';

	constructor( public filteringContainer: any )
	{
	}

	processPayload( payload: any )
	{
		const $uiRouterGlobals = getProvider<UIRouterGlobals>( '$uiRouterGlobals' );

		this.games = Game.populate( payload.games );
		this.gamesCount = payload.gamesCount;
		this.perPage = payload.perPage;
		this.currentPage = $uiRouterGlobals.params['page'] || 1;
		this.section = $uiRouterGlobals.params['section'];
	}
}
