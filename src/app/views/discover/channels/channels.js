angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'discover.channels', {
		url: '/channels',
		abstract: true,
		template: '<ui-view></ui-view>',
		resolve: {

			// Channel controllers are lazy loaded.
			components: function( $ocLazyLoad )
			{
				return $ocLazyLoad.load( '/app/modules/channels.js' );
			},
		}
	} );
} );
