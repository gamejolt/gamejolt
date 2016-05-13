angular.module( 'App' ).config( function( EnvironmentProvider, $compileProvider, $locationProvider )
{
	EnvironmentProvider.env = 'development';
	$compileProvider.debugInfoEnabled( true );
} );
