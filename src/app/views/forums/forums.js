angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'forums', {
		abstract: true,
		template: '<ui-view></ui-view>',
		resolve: {
			init: function( Translate )
			{
				return Translate.loadSection( 'main' );
			},
			components: function( $ocLazyLoad )
			{
				return $ocLazyLoad.load( '/app/modules/forums.js' );
			}
		}
	} );
} );
