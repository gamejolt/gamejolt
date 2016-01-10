angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.api', {
		abstract: true,
		url: '/api',
		templateUrl: '/app/views/dashboard/developer/games/manage/api/api.html',
	} );
} );
