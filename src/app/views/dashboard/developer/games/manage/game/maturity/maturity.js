angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.game.maturity', {
		url: '/maturity',
		controller: 'Dashboard.Developer.Games.Manage.Game.MaturityCtrl',
		controllerAs: 'maturityCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/game/maturity/maturity.html',
		// resolve: {
		// 	payload: function( Api, $stateParams )
		// 	{
		// 		return Api.sendRequest( '/web/dash/developer/games/' + $stateParams.id );
		// 	}
		// }
	} );
} );
