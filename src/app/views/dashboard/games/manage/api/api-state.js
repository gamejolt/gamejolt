angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dash.games.manage.api', {
		abstract: true,
		url: '/api',
		templateUrl: require( './api.html' ),
	} );
} );
