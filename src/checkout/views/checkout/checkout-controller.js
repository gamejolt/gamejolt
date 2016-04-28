angular.module( 'App.Views' ).controller( 'CheckoutCtrl', function( $window, App, Environment, Sellable, Game, payload )
{
	this.cards = payload.cards || [];
	this.sellable = new Sellable( payload.sellable );
	this.order = payload.order;
	this.game = new Game( payload.game );

	App.title = 'Buy ' + this.sellable.title;

	$window.Stripe.setPublishableKey( payload.stripePublishableKey );

	this.onSubmit = function( $response )
	{
		$window.location = $response.redirectUrl;
	};
} );
