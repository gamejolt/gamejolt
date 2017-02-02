angular.module( 'App.Views' ).config( function( $stateProvider, $urlRouterProvider )
{
	$urlRouterProvider.when( '/dashboard/developer/games/soundtracks/:id/', '/dashboard/developer/games/:id/music' );

	$stateProvider.state( 'dashboard.developer.games.manage.game.music', {
		url: '/music',
		controller: 'Dashboard.Developer.Games.Manage.Game.MusicCtrl',
		controllerAs: 'musicCtrl',
		templateUrl: require( './music.html' ),
		resolve: {
			payload: function( Api, $stateParams )
			{
				return Api.sendRequest( '/web/dash/developer/games/music/' + $stateParams.id );
			}
		}
	} );
} );
