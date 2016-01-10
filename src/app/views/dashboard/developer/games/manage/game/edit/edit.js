angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
{
	$urlRouterProvider.when( '/dashboard/developer/games/edit/:id', '/dashboard/games/:id/edit' );

	$stateProvider.state( 'dashboard.developer.games.manage.game.edit', {
		url: '/edit',
		controller: 'Dashboard.Developer.Games.Manage.Game.EditCtrl',
		controllerAs: 'editCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/game/edit/edit.html',
		// resolve: {
		// 	payload: function( Api, $stateParams )
		// 	{
		// 		return Api.sendRequest( '/web/dash/developer/games/' + $stateParams.id );
		// 	}
		// }
	} );
} );
