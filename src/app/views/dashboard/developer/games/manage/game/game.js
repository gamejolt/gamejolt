angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.game', {
		abstract: true,
		templateUrl: '/app/views/dashboard/developer/games/manage/game/game.html',
	} );
} );
