angular.module( 'App' ).config( function( EnvironmentProvider, $compileProvider, $locationProvider )
{
	EnvironmentProvider.env = 'development';
	EnvironmentProvider.buildType = 'development';
	$compileProvider.debugInfoEnabled( true );
} );
