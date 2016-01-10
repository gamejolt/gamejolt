angular.module( 'App' ).config( function( EnvironmentProvider, $compileProvider )
{
	EnvironmentProvider.env = 'development';
	$compileProvider.debugInfoEnabled( true );
} );
