angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard.developer.games.manage.key-groups', {
		abstract: true,
		url: '/keys',
		templateUrl: '/app/views/dashboard/developer/games/manage/key-groups/key-groups.html',
	} );
} );
