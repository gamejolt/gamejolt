angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'client', {
		url: '/client',
		controller: 'ClientCtrl',
		controllerAs: 'clientCtrl',
		templateUrl: '/app/views/client/client.html',
		resolve: {
			payload: function( Api )
			{
				return Api.sendRequest( '/web/client' );
			},
			uaParser: function( $ocLazyLoad )
			{
				return $ocLazyLoad.load( '/app/modules/ua-parser.js' );
			},
			init: function( Translate )
			{
				return Translate.loadSection( 'main' );
			},
		}
	} );
} );
