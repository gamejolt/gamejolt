angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'radio', {
		url: '/radio',
		controller: 'RadioCtrl',
		controllerAs: 'radioCtrl',
		templateUrl: '/app/views/radio/radio.html',
		resolve: {
			init: function( Translate )
			{
				return Translate.loadSection( 'main' );
			},

			// Radio stuff is lazy loaded.
			components: function( $ocLazyLoad )
			{
				return $ocLazyLoad.load( '/app/modules/radio.js' );
			},
		}
	} );
} );
