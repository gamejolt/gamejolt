import View from '!view!./view.html?style=./view.styl';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { GamePackage } from 'game-jolt-frontend-lib/components/game/package/package.model';
import { AppGameThumbnailImg } from 'game-jolt-frontend-lib/components/game/thumbnail-img/thumbnail-img';
import { Geo } from 'game-jolt-frontend-lib/components/geo/geo.service';
import { Order } from 'game-jolt-frontend-lib/components/order/order.model';
import { OrderPayment } from 'game-jolt-frontend-lib/components/order/payment/payment.model';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { Translate } from 'game-jolt-frontend-lib/components/translate/translate.service';
import { arrayGroupBy, arrayIndexBy } from 'game-jolt-frontend-lib/utils/array';
import { currency } from 'game-jolt-frontend-lib/vue/filters/currency';
import { date } from 'game-jolt-frontend-lib/vue/filters/date';
import { Component } from 'vue-property-decorator';
import { routeStore, RouteStore, RouteStoreModule } from '../../account.store';

@View
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
