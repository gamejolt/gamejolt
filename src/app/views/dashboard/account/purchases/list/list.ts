import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../_common/api/api.service';
import { formatCurrency } from '../../../../../../_common/filters/currency';
import { formatDate } from '../../../../../../_common/filters/date';
import { Order } from '../../../../../../_common/order/order.model';
import { BaseRouteComponent, RouteResolver } from '../../../../../../_common/route/route-component';
import { Translate } from '../../../../../../_common/translate/translate.service';
import { routeStore, RouteStore, RouteStoreModule } from '../../account.store';

@Options({
	name: 'RouteDashAccountPurchasesList',
})
@RouteResolver({
	cache: true,
	deps: {},
	resolver: () => Api.sendRequest('/web/dash/purchases'),
	resolveStore() {
		routeStore.commit('setHeading', Translate.$gettext(`Order History`));
	},
})
export default class RouteDashAccountPurchasesList extends BaseRouteComponent {
	@RouteStoreModule.State
	heading!: RouteStore['heading'];

	orders: Order[] = [];

	readonly date = formatDate;
	readonly currency = formatCurrency;

	get routeTitle() {
		return this.heading;
	}

	routeResolved($payload: any) {
		this.orders = Order.populate($payload.orders);
	}
}
