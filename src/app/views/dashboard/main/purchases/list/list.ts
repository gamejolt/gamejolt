import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./list.html';

import { RouteResolve } from '../../../../../../lib/gj-lib-client/utils/router';
import { Api } from '../../../../../../lib/gj-lib-client/components/api/api.service';
import { Meta } from '../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { Order } from '../../../../../../lib/gj-lib-client/components/order/order.model';
import { date } from '../../../../../../lib/gj-lib-client/vue/filters/date';
import { currency } from '../../../../../../lib/gj-lib-client/vue/filters/currency';

@View
@Component({
	filters: {
		date,
		currency,
	},
})
export default class RouteDashMainPurchasesList extends Vue {
	orders: Order[] = [];

	date = date;

	@RouteResolve({ cache: true })
	routeResolve() {
		return Api.sendRequest('/web/dash/purchases');
	}

	routeInit() {
		Meta.title = this.$gettext('Order History');
	}

	routed() {
		this.orders = Order.populate(this.$payload.orders);
	}
}
