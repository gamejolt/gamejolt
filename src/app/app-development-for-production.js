angular.module( 'App' ).config( function( EnvironmentProvider, $compileProvider )
{
	EnvironmentProvider.buildType = 'development';
	$compileProvider.debugInfoEnabled( true );
} );
