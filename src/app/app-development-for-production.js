angular.module( 'App' ).config( function( EnvironmentProvider, $compileProvider )
{
	EnvironmentProvider.env = 'production';
	EnvironmentProvider.isDev = true;
	$compileProvider.debugInfoEnabled( true );
} );
