import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../_common/api/api.service';
import { Environment } from '../../../_common/environment/environment.service';
import { Game } from '../../../_common/game/game.model';
import { showErrorGrowl } from '../../../_common/growls/growls.service';
import AppMediaItemCover from '../../../_common/media-item/cover/cover.vue';
import { Navigate } from '../../../_common/navigate/navigate.service';
import { Order } from '../../../_common/order/order.model';
import { BaseRouteComponent, RouteResolver } from '../../../_common/route/route-component';
import { Sellable } from '../../../_common/sellable/sellable.model';
import { useThemeStore } from '../../../_common/theme/theme.store';
import FormPayment from '../../components/forms/payment/payment.vue';

const CheckoutThemeKey = 'checkout';

@Options({
	name: 'RouteCheckout',
	components: {
		AppMediaItemCover,
		FormPayment,
	},
})
@RouteResolver({
	resolver: ({ route }) => Api.sendRequest('/web/checkout/' + route.params.orderId),
})
export default class RouteCheckout extends BaseRouteComponent {
	themeStore = setup(() => useThemeStore());

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
		this.setPageTheme();

		window.Stripe.setPublishableKey($payload.stripePublishableKey);
	}

	routeDestroyed() {
		this.themeStore.clearPageTheme(CheckoutThemeKey);
	}

	onSubmit(_formModel: any, response: any) {
		let redirect: string | null = null;

		// For client, the orders are always done as a user.
		// We will always go back to game page in those cases.
		// For non-users on site they may have to go to a key page.
		if (GJ_IS_DESKTOP_APP) {
			redirect = Environment.wttfBaseUrl + '/games/' + this.game.slug + '/' + this.game.id;
		} else {
			redirect = response.redirectUrl;
		}

		if (!redirect) {
			showErrorGrowl(this.$gettext('Could not redirect.'));
			return;
		}

		Navigate.goto(redirect);
	}

	private setPageTheme() {
		const theme = this.game.theme ?? null;
		this.themeStore.setPageTheme({
			key: CheckoutThemeKey,
			theme,
		});
	}
}
