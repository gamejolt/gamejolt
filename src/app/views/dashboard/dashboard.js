angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard', {
		abstract: true,
		url: '/dashboard',
		template: '<ui-view/>',
		resolve: {
			components: function( $ocLazyLoad )
			{
				return $ocLazyLoad.load( '/app/modules/dash.js' );
			}
		}
	} );
} );
