angular.module( 'App.Views' ).controller( 'CheckoutCtrl', function( $window, App, Environment, Sellable, Game, Growls, payload )
{
	this.cards = payload.cards || [];
	this.sellable = new Sellable( payload.sellable );
	this.order = payload.order;
	this.game = new Game( payload.game );

	App.title = 'Buy ' + this.sellable.title;

	$window.Stripe.setPublishableKey( payload.stripePublishableKey );

	this.onSubmit = function( $response )
	{
		var redirect = null;

		// For client, the orders are always done as a user.
		// We will always go back to game page in those cases.
		// For non-users on site they may have to go to a key page.
		if ( Environment.isClient ) {
			redirect = Environment.wttfBaseUrl + '/games/' + this.game.slug + '/' + this.game.id;
		}
		else {
			redirect = $response.redirectUrl;
		}

		if ( !redirect ) {
			Growls.error( 'Could not redirect.' );
			return;
		}

		$window.location.href = redirect;
	};
} );
