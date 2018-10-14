import View from '!view!./list.html';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import { Order } from '../../../../../../lib/gj-lib-client/components/order/order.model';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../lib/gj-lib-client/components/route/route-component';
import { currency } from '../../../../../../lib/gj-lib-client/vue/filters/currency';
import { date } from '../../../../../../lib/gj-lib-client/vue/filters/date';

@View
@Component({
	name: 'RouteDashMainPurchasesList',
	filters: {
		date,
		currency,
	},
})
@RouteResolver({
	cache: true,
	deps: {},
	resolver: () => Api.sendRequest('/web/dash/purchases'),
})
export default class RouteDashMainPurchasesList extends BaseRouteComponent {
	orders: Order[] = [];

	date = date;

	get routeTitle() {
		return this.$gettext('Order History');
	}

	routeResolved($payload: any) {
		this.orders = Order.populate($payload.orders);
	}
}
