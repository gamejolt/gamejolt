import { Injectable, Inject } from 'ng-metadata/core';
import { GamesCtrl } from '../games-controller';

interface Scope extends angular.IScope {
	gamesCtrl: GamesCtrl;
}

@Injectable()
export class FetchCtrl
{
	games: any[];

	constructor(
		@Inject( '$scope' ) $scope: Scope,
		@Inject( '$stateParams' ) $stateParams: angular.ui.IStateParamsService,
		@Inject( 'Game' ) game: any,
		@Inject( 'payload' ) payload: any
	)
	{
		this.games = game.populate( payload.games );
		$scope.gamesCtrl.processPayload( $stateParams, payload );
	}
}
