import { CheckoutCtrl } from './checkout-controller';

const MODULE = 'App.Views.Checkout';
export default MODULE;

angular.module( MODULE, [] )
.config( function( $stateProvider )
{
	$stateProvider.state( 'checkout', {
		url: '/checkout/:orderId',
		controller: CheckoutCtrl,
		controllerAs: 'checkoutCtrl',
		templateUrl: '/checkout/views/checkout/checkout.html',
		resolve: {
			// init: function( Translate )
			// {
			// 	// Bootstrap the translation for this module.
			// 	return Translate.addParts( 'checkout' );
			// },
			payload: ( $stateParams, Api ) =>
			{
				return Api.sendRequest( '/web/checkout/' + $stateParams.orderId, {} );
			}
		}
	} );
} );
