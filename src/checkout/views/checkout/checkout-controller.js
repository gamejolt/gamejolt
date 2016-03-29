angular.module( 'App.Views' ).controller( 'CheckoutCtrl', function( $window, Sellable, Game, payload )
{
	this.cards = payload.cards || [];
	this.sellable = new Sellable( payload.sellable );
	this.order = payload.order;
	this.game = new Game( payload.game );

	$window.Stripe.setPublishableKey( payload.stripePublishableKey );
} );
