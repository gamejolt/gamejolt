import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Environment } from 'game-jolt-frontend-lib/components/environment/environment.service';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import { Navigate } from 'game-jolt-frontend-lib/components/navigate/navigate.service';
import { Order } from 'game-jolt-frontend-lib/components/order/order.model';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Sellable } from 'game-jolt-frontend-lib/components/sellable/sellable.model';
import { ThemeMutation, ThemeStore } from 'game-jolt-frontend-lib/components/theme/theme.store';
import { Component } from 'vue-property-decorator';
import AppMediaItemCover from '../../../_common/media-item/cover/cover.vue';
import FormPayment from '../../components/forms/payment/payment.vue';

@Component({
	name: 'RouteCheckout',
	components: {
		AppMediaItemCover,
		FormPayment,
	},
})
@RouteResolver({
	resolver: ({ route }) => Api.sendRequest('/web/checkout/' + route.params.orderId, {}),
})
export default class RouteCheckout extends BaseRouteComponent {
	@ThemeMutation
	setPageTheme!: ThemeStore['setPageTheme'];

	cards!: any[];
	sellable!: Sellable;
	order!: Order;
	game!: Game;

	Environment = Environment;

	get routeTitle() {
		if (this.sellable) {
			return this.$gettextInterpolate('Buy %{ game }', {
				game: this.sellable.title,
			});
		}
		return null;
	}

	routeResolved($payload: any) {
		this.cards = $payload.cards || [];
		this.sellable = new Sellable($payload.sellable);
		this.order = new Order($payload.order);
		this.game = new Game($payload.game);
		this.setPageTheme(this.game.theme || null);

		window.Stripe.setPublishableKey($payload.stripePublishableKey);
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

		Navigate.goto(redirect);
	}
}
