import { Injectable, Inject } from 'ng-metadata/core';
import { App } from './../../app-service';

@Injectable()
export class CheckoutCtrl
{
	cards: any[];
	sellable: any;
	order: any;
	game: any;

	constructor(
		@Inject( '$window' ) private $window: angular.IWindowService,
		@Inject( 'App' ) app: App,
		@Inject( 'Environment' ) private environment: any,
		@Inject( 'Sellable' ) sellable: any,
		@Inject( 'Game' ) game: any,
		@Inject( 'Growls' ) private growls: any,
		@Inject( 'payload' ) payload: any
	)
	{
		this.cards = payload.cards || [];
		this.sellable = new sellable( payload.sellable );
		this.order = payload.order;
		this.game = new game( payload.game );

		app.title = 'Buy ' + this.sellable.title;

		$window.Stripe.setPublishableKey( payload.stripePublishableKey );
	}

	onSubmit( $response )
	{
		var redirect = null;

		// For client, the orders are always done as a user.
		// We will always go back to game page in those cases.
		// For non-users on site they may have to go to a key page.
		if ( this.environment.isClient ) {
			redirect = this.environment.wttfBaseUrl + '/games/' + this.game.slug + '/' + this.game.id;
		}
		else {
			redirect = $response.redirectUrl;
		}

		if ( !redirect ) {
			this.growls.error( 'Could not redirect.' );
			return;
		}

		this.$window.location.href = redirect;
	}
}
