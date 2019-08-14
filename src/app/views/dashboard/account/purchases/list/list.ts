import { Api } from '../../../../../../_common/api/api.service';
import { Order } from '../../../../../../_common/order/order.model';
import { BaseRouteComponent, RouteResolver } from '../../../../../../_common/route/route-component';
import { Translate } from '../../../../../../_common/translate/translate.service';
import { currency } from '../../../../../../_common/filters/currency';
import { date } from '../../../../../../_common/filters/date';
import { Component } from 'vue-property-decorator';
import { routeStore, RouteStore, RouteStoreModule } from '../../account.store';

@Component({
	name: 'RouteDashAccountPurchasesList',
	filters: {
		date,
		currency,
	},
})
@RouteResolver({
	cache: true,
	deps: {},
	resolver: () => Api.sendRequest('/web/dash/purchases'),
	resolveStore({}) {
		routeStore.commit('setHeading', Translate.$gettext(`Order History`));
	},
})
export default class RouteDashAccountPurchasesList extends BaseRouteComponent {
	@RouteStoreModule.State
	heading!: RouteStore['heading'];

	orders: Order[] = [];

	date = date;

	get routeTitle() {
		return this.heading;
	}

	routeResolved($payload: any) {
		this.orders = Order.populate($payload.orders);
	}
}
