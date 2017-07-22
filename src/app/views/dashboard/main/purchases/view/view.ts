import VueRouter from 'vue-router';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./view.html?style=./view.styl';

import { Geo } from '../../../../../../lib/gj-lib-client/components/geo/geo.service';
import { OrderPayment } from '../../../../../../lib/gj-lib-client/components/order/payment/payment.model';
import { date } from '../../../../../../lib/gj-lib-client/vue/filters/date';
import { Order } from '../../../../../../lib/gj-lib-client/components/order/order.model';
import { OrderPaymentRefund } from '../../../../../../lib/gj-lib-client/components/order/payment/refund/refund.model';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import { GamePackage } from '../../../../../../lib/gj-lib-client/components/game/package/package.model';
import { Meta } from '../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { arrayIndexBy } from '../../../../../../lib/gj-lib-client/utils/array';
import { Game } from '../../../../../../lib/gj-lib-client/components/game/game.model';
import { AppGameThumbnailImg } from '../../../../../../lib/gj-lib-client/components/game/thumbnail-img/thumbnail-img';
import { currency } from '../../../../../../lib/gj-lib-client/vue/filters/currency';
import { Screen } from '../../../../../../lib/gj-lib-client/components/screen/screen-service';
import { makeObservableService } from '../../../../../../lib/gj-lib-client/utils/vue';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	components: {
		AppGameThumbnailImg,
	},
	filters: {
		currency,
		date,
	},
})
export default class RouteDashMainPurchasesView extends BaseRouteComponent {
	order: Order = null as any;
	packagesBySellable: any = null;
	games: any = null;

	firstRefund: OrderPaymentRefund | null = null;

	Geo = Geo;
	OrderPayment = OrderPayment;
	date = date;
	Screen = makeObservableService(Screen);

	@RouteResolve()
	routeResolve(this: undefined, route: VueRouter.Route) {
		return Api.sendRequest('/web/dash/purchases/' + route.params.id);
	}

	routed() {
		this.order = new Order(this.$payload.order);
		this.games = arrayIndexBy(Game.populate(this.$payload.games), 'id');

		const packages: GamePackage[] = GamePackage.populate(this.$payload.packages);
		this.packagesBySellable = {};
		for (const _package of packages) {
			if (!this.packagesBySellable[_package.sellable_id]) {
				this.packagesBySellable[_package.sellable_id] = [];
			}
			this.packagesBySellable[_package.sellable_id].push(_package);
		}

		this.firstRefund = null;
		if (this.order._is_refunded && this.order.payments[0] && this.order.payments[0].refunds) {
			this.firstRefund = this.order.payments[0].refunds[0];
		}

		Meta.title = this.$gettextInterpolate(`View Order: #%{ orderId }`, {
			orderId: this.order.id,
		});
	}
}
