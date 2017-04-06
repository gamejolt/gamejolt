import { Injectable } from 'ng-metadata/core';

export function GameListingContainerFactory(
	$stateParams: any,
	Game: any,
)
{
	GameListingContainer.$stateParams = $stateParams;
	GameListingContainer.gameModel = Game;
	return GameListingContainer;
}

@Injectable()
export class GameListingContainer
{
	static $stateParams: ng.ui.IStateParamsService;
	static gameModel: any;

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
		this.games = GameListingContainer.gameModel.populate( payload.games );
		this.gamesCount = payload.gamesCount;
		this.perPage = payload.perPage;
		this.currentPage = GameListingContainer.$stateParams['page'] || 1;
		this.section = GameListingContainer.$stateParams['section'];
	}
}
