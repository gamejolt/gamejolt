angular.module( 'App.Views' ).config( function( $stateProvider )
{
	$stateProvider.state( 'landing.marketplace', {
		url: '/marketplace',
		controller: 'MarketplaceCtrl',
		controllerAs: '$ctrl',
		templateUrl: '/app/views/landing/marketplace/marketplace.html',
		resolve: {
			payload: function( Api )
			{
				return Api.sendRequest( '/web/marketplace' );
			},
		}
	} );
} );
