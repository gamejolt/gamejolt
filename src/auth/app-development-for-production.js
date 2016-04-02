angular.module( 'App' ).config( function( EnvironmentProvider, $compileProvider, $locationProvider )
{
	EnvironmentProvider.buildType = 'development';
	$compileProvider.debugInfoEnabled( true );
} );
