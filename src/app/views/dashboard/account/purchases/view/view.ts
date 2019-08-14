import { Api } from '../../../../../../_common/api/api.service';
import { Game } from '../../../../../../_common/game/game.model';
import { GamePackage } from '../../../../../../_common/game/package/package.model';
import AppGameThumbnailImg from '../../../../../../_common/game/thumbnail-img/thumbnail-img.vue';
import { Geo } from '../../../../../../_common/geo/geo.service';
import { Order } from '../../../../../../_common/order/order.model';
import { OrderPayment } from '../../../../../../_common/order/payment/payment.model';
import { BaseRouteComponent, RouteResolver } from '../../../../../../_common/route/route-component';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { Translate } from '../../../../../../_common/translate/translate.service';
import { arrayGroupBy, arrayIndexBy } from '../../../../../../utils/array';
import { currency } from '../../../../../../_common/filters/currency';
import { date } from '../../../../../../_common/filters/date';
import { Component } from 'vue-property-decorator';
import { routeStore, RouteStore, RouteStoreModule } from '../../account.store';

@Component({
	name: 'RouteDashAccountPurchasesView',
	components: {
		AppGameThumbnailImg,
	},
	filters: {
		currency,
	},
})
@RouteResolver({
	deps: { params: ['id'] },
	resolver: ({ route }) => Api.sendRequest('/web/dash/purchases/' + route.params.id),
	resolveStore() {
		routeStore.commit('setHeading', Translate.$gettext(`Order Details`));
	},
})
export default class RouteDashAccountPurchasesView extends BaseRouteComponent {
	@RouteStoreModule.State
	heading!: RouteStore['heading'];

	order: Order = null as any;
	packages: GamePackage[] = [];
	games: Game[] = [];

	readonly Geo = Geo;
	readonly OrderPayment = OrderPayment;
	readonly date = date;
	readonly Screen = Screen;

	get routeTitle() {
		return this.heading;
	}

	get gamesById() {
		return arrayIndexBy(this.games, 'id');
	}

	get packagesBySellable() {
		return arrayGroupBy(this.packages, 'sellable_id');
	}

	get firstRefund() {
		if (
			this.order._is_refunded &&
			this.order.payments &&
			this.order.payments[0] &&
			this.order.payments[0].refunds
		) {
			return this.order.payments[0].refunds[0];
		}
		return null;
	}

	routeResolved($payload: any) {
		this.order = new Order($payload.order);
		this.games = Game.populate($payload.games);
		this.packages = GamePackage.populate($payload.packages);
	}
}
