export class FetchCtrl
{
	games: any[];

	constructor( $scope, $stateParams, Game, payload )
	{
		var gamesCtrl = $scope.gamesCtrl;

		this.games = Game.populate( payload.games );
		gamesCtrl.processPayload( $stateParams, payload );
	}
}
