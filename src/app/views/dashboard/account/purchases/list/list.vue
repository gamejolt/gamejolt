<script lang="ts">
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

	readonly formatDate = formatDate;
	readonly formatCurrency = formatCurrency;

	get routeTitle() {
		return this.heading;
	}

	routeResolved($payload: any) {
		this.orders = Order.populate($payload.orders);
	}
}
</script>

<template>
	<div v-if="isRouteBootstrapped">
		<table v-if="orders.length" class="table">
			<thead>
				<tr>
					<th><translate>Order #</translate></th>
					<th><translate>Item(s)</translate></th>
					<th><translate>Purchase Date</translate></th>
					<th class="text-right"><translate>Amount</translate></th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="order of orders" :key="order.id">
					<td>
						<strong>
							<router-link
								:to="{
									name: 'dash.account.purchases.view',
									params: { id: order.id },
								}"
							>
								{{ order.id }}
							</router-link>
						</strong>
					</td>
					<td>
						{{ order.items[0].sellable ? order.items[0].sellable.title : '-' }}
					</td>
					<td :title="formatDate(order.completed_on, 'medium')">
						{{ formatDate(order.completed_on, 'mediumDate') }}
					</td>
					<td class="text-right">
						<span v-if="order._is_refunded" class="tag tag-notice">
							<translate>Refunded</translate>
						</span>
						{{ formatCurrency(order.total_amount) }}
					</td>
				</tr>
			</tbody>
		</table>
		<div v-else class="row">
			<div class="col-md-6 col-centered">
				<p class="lead text-center">
					<translate>
						You haven't bought any games on the site yet. Once you do, you'll be able to
						see all of your orders here and the details for each order.
					</translate>
				</p>
			</div>
		</div>
	</div>
</template>
