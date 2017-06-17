import { Injectable, Inject } from 'ng-metadata/core';
import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';
import { Sellable } from '../../../lib/gj-lib-client/components/sellable/sellable.model';
import { Game } from '../../../lib/gj-lib-client/components/game/game.model';
import { Meta } from '../../../lib/gj-lib-client/components/meta/meta-service';
import { Growls } from '../../../lib/gj-lib-client/components/growls/growls.service';

@Injectable()
export class CheckoutCtrl {
	cards: any[];
	sellable: any;
	order: any;
	game: any;

	constructor(
		@Inject('$window') private $window: ng.IWindowService,
		@Inject('payload') payload: any
	) {
		this.cards = payload.cards || [];
		this.sellable = new Sellable(payload.sellable);
		this.order = payload.order;
		this.game = new Game(payload.game);

		Meta.title = 'Buy ' + this.sellable.title;

		$window.Stripe.setPublishableKey(payload.stripePublishableKey);
	}

	onSubmit($response: any) {
		let redirect: string | null = null;

		// For client, the orders are always done as a user.
		// We will always go back to game page in those cases.
		// For non-users on site they may have to go to a key page.
		if (GJ_IS_CLIENT) {
			redirect =
				Environment.wttfBaseUrl +
				'/games/' +
				this.game.slug +
				'/' +
				this.game.id;
		} else {
			redirect = $response.redirectUrl;
		}

		if (!redirect) {
			Growls.error('Could not redirect.');
			return;
		}

		this.$window.location.href = redirect;
	}
}
