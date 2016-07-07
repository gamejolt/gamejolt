angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
{
	$urlRouterProvider.when( '/dashboard/developer/games/screenshots/:id', '/dashboard/developer/games/:id/media' );
	$urlRouterProvider.when( '/dashboard/developer/games/videos/:id', '/dashboard/developer/games/:id/media' );

	$stateProvider.state( 'dashboard.developer.games.manage.game.media', {
		url: '/media',
		controller: 'Dashboard.Developer.Games.Manage.Game.MediaCtrl',
		controllerAs: 'mediaCtrl',
		templateUrl: '/app/views/dashboard/developer/games/manage/game/media/media.html',
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/dash/developer/games/media/' + $stateParams.id );
			}
		}
	} );
} );
