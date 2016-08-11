angular.module( 'App.Views' )
.config( function( $stateProvider )
{
	$stateProvider.state( 'checkout', {
		url: '/checkout/:orderId',
		controller: 'CheckoutCtrl',
		controllerAs: 'checkoutCtrl',
		templateUrl: '/checkout/views/checkout/checkout.html',
		resolve: {
			// init: function( Translate )
			// {
			// 	// Bootstrap the translation for this module.
			// 	return Translate.addParts( 'checkout' );
			// },
			payload: function( $stateParams, Api )
			{
				return Api.sendRequest( '/web/checkout/' + $stateParams.orderId, {} );
			}
		}
	} );
} );
