angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'client', {
		url: '/client',
		controller: 'ClientCtrl',
		controllerAs: 'clientCtrl',
		templateUrl: '/app/views/client/client.html',
		resolve: {
			uaParser: function( $ocLazyLoad )
			{
				return $ocLazyLoad.load( '/app/modules/ua-parser.js' );
			},
			init: function( Translate )
			{
				return Translate.loadSection( 'main' );
			},
			touch: function( User )
			{
				// No need to wait on this.
				User.touch();
			}
		}
	} );
} );
