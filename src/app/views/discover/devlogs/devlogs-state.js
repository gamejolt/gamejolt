angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'discover.devlogs', {
		url: '/devlogs',
		abstract: true,
		templateUrl: '/app/views/discover/devlogs/devlogs.html',
	} );
} );
