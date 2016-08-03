angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'dashboard', {
		abstract: true,
		url: '/dashboard',
		template: '<ui-view/>',
		resolve: {
			init: function( $q, Translate )
			{
				return $q.all( [ Translate.loadSection( 'main' ), Translate.loadSection( 'dash' ) ] );
			},
			components: function( $ocLazyLoad )
			{
				return $ocLazyLoad.load( '/app/modules/dash.js' );
			}
		}
	} );
} );
