angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'fireside', {
		abstract: true,
		url: '/fireside',
		template: '<ui-view></ui-view>',
		resolve: {
			init: function( Translate )
			{
				return Translate.loadSection( 'main' );
			},

			// Fireside stuff is lazy loaded.
			components: function( $ocLazyLoad )
			{
				return $ocLazyLoad.load( '/app/modules/fireside.js' );
			},
		}
	} );
} );
