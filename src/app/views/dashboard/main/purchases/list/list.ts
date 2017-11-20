import { Component } from 'vue-property-decorator';
import View from '!view!./list.html';

import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import { Order } from '../../../../../../lib/gj-lib-client/components/order/order.model';
import { date } from '../../../../../../lib/gj-lib-client/vue/filters/date';
import { currency } from '../../../../../../lib/gj-lib-client/vue/filters/currency';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../lib/gj-lib-client/components/route/route-component';

@View
@Component({
	name: 'RouteDashMainPurchasesList',
	filters: {
		date,
		currency,
	},
})
export default class RouteDashMainPurchasesList extends BaseRouteComponent {
	orders: Order[] = [];

	date = date;

	@RouteResolve({ cache: true })
	routeResolve() {
		return Api.sendRequest('/web/dash/purchases');
	}

	get routeTitle() {
		return this.$gettext('Order History');
	}

	routed($payload: any) {
		this.orders = Order.populate($payload.orders);
	}
}
