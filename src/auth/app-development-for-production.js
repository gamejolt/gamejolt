angular.module( 'App' ).config( function( EnvironmentProvider, $compileProvider, $locationProvider )
{
	EnvironmentProvider.env = 'production';
	EnvironmentProvider.buildType = 'development';
	$compileProvider.debugInfoEnabled( true );
} );
