import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Order } from 'game-jolt-frontend-lib/components/order/order.model';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { Translate } from 'game-jolt-frontend-lib/components/translate/translate.service';
import { currency } from 'game-jolt-frontend-lib/vue/filters/currency';
import { date } from 'game-jolt-frontend-lib/vue/filters/date';
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
