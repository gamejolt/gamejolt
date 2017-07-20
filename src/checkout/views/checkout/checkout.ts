import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./checkout.html?style=./checkout.styl';

import { Sellable } from '../../../lib/gj-lib-client/components/sellable/sellable.model';
import { Order } from '../../../lib/gj-lib-client/components/order/order.model';
import { Game } from '../../../lib/gj-lib-client/components/game/game.model';
import { Api } from '../../../lib/gj-lib-client/components/api/api.service';
import { Meta } from '../../../lib/gj-lib-client/components/meta/meta-service';
import { Environment } from '../../../lib/gj-lib-client/components/environment/environment.service';
import { Growls } from '../../../lib/gj-lib-client/components/growls/growls.service';
import { AppMediaItemCover } from '../../../app/components/media-item/cover/cover';
import { FormPayment } from '../../components/forms/payment/payment';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	components: {
		AppMediaItemCover,
		FormPayment,
	},
})
export default class RouteCheckout extends BaseRouteComponent {
	cards: any[];
	sellable: Sellable;
	order: Order;
	game: Game;

	Environment = Environment;

	@RouteResolve()
	routeResolve(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest('/web/checkout/' + route.params.orderId, {});
	}

	routed() {
		this.cards = this.$payload.cards || [];
		this.sellable = new Sellable(this.$payload.sellable);
		this.order = new Order(this.$payload.order);
		this.game = new Game(this.$payload.game);

		Meta.title = this.$gettextInterpolate('Buy %{ game }', {
			game: this.sellable.title,
		});

		window.Stripe.setPublishableKey(this.$payload.stripePublishableKey);
	}

	onSubmit(_formModel: any, response: any) {
		let redirect: string | null = null;

		// For client, the orders are always done as a user.
		// We will always go back to game page in those cases.
		// For non-users on site they may have to go to a key page.
		if (GJ_IS_CLIENT) {
			redirect = Environment.wttfBaseUrl + '/games/' + this.game.slug + '/' + this.game.id;
		} else {
			redirect = response.redirectUrl;
		}

		if (!redirect) {
			Growls.error(this.$gettext('Could not redirect.'));
			return;
		}

		window.location.href = redirect;
	}
}
