angular.module( 'App.Views' ).controller( 'CheckoutCtrl', function( $window, $scope, payload )
{
	this.cards = payload.cards || [];
	this.bucket = payload.bucket;
	this.order = payload.order;

	$window.Stripe.setPublishableKey( payload.stripePublishableKey );
} );
