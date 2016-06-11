export class CheckoutCtrl
{
	cards: any[];
	sellable: any;
	order: any;
	game: any;

	constructor( private $window, App, private Environment, Sellable, Game, private Growls, payload )
	{
		this.cards = payload.cards || [];
		this.sellable = new Sellable( payload.sellable );
		this.order = payload.order;
		this.game = new Game( payload.game );

		App.title = 'Buy ' + this.sellable.title;

		$window.Stripe.setPublishableKey( payload.stripePublishableKey );
	}

	onSubmit( $response )
	{
		var redirect = null;

		// For client, the orders are always done as a user.
		// We will always go back to game page in those cases.
		// For non-users on site they may have to go to a key page.
		if ( this.Environment.isClient ) {
			redirect = this.Environment.wttfBaseUrl + '/games/' + this.game.slug + '/' + this.game.id;
		}
		else {
			redirect = $response.redirectUrl;
		}

		if ( !redirect ) {
			this.Growls.error( 'Could not redirect.' );
			return;
		}

		this.$window.location.href = redirect;
	}
}
