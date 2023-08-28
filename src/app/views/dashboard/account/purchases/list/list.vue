<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../_common/api/api.service';
import { formatCurrency } from '../../../../../../_common/filters/currency';
import { formatDate } from '../../../../../../_common/filters/date';
import { OrderModel } from '../../../../../../_common/order/order.model';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../_common/route/legacy-route-component';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { useAccountRouteController } from '../../RouteDashAccount.vue';

@Options({
	name: 'RouteDashAccountPurchasesList',
})
@OptionsForLegacyRoute({
	cache: true,
	deps: {},
	resolver: () => Api.sendRequest('/web/dash/purchases'),
})
export default class RouteDashAccountPurchasesList extends LegacyRouteComponent {
	routeStore = setup(() => useAccountRouteController()!);

	orders: OrderModel[] = [];

	readonly formatDate = formatDate;
	readonly formatCurrency = formatCurrency;

	get routeTitle() {
		return this.routeStore.heading;
	}

	routeCreated() {
		this.routeStore.heading = $gettext(`Order History`);
	}

	routeResolved($payload: any) {
		this.orders = OrderModel.populate($payload.orders);
	}
}
</script>

<template>
	<div v-if="isRouteBootstrapped">
		<table v-if="orders.length" class="table">
			<thead>
				<tr>
					<th><AppTranslate>Order #</AppTranslate></th>
					<th><AppTranslate>Item(s)</AppTranslate></th>
					<th><AppTranslate>Purchase Date</AppTranslate></th>
					<th class="text-right"><AppTranslate>Amount</AppTranslate></th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="order of orders" :key="order.id">
					<td>
						<strong>
							<router-link
								:to="{
									name: 'dash.account.purchases.view',
									params: { hash: order.hash },
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
							<AppTranslate>Refunded</AppTranslate>
						</span>
						{{ formatCurrency(order.total_amount) }}
					</td>
				</tr>
			</tbody>
		</table>
		<div v-else class="row">
			<div class="col-md-6 col-centered">
				<p class="lead text-center">
					<AppTranslate>
						You haven't bought any games on the site yet. Once you do, you'll be able to
						see all of your orders here and the details for each order.
					</AppTranslate>
				</p>
			</div>
		</div>
	</div>
</template>
