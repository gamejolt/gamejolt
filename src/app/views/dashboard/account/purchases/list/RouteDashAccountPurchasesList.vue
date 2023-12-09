<script lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { Api } from '../../../../../../_common/api/api.service';
import { formatCurrency } from '../../../../../../_common/filters/currency';
import { formatDate } from '../../../../../../_common/filters/date';
import { OrderModel } from '../../../../../../_common/order/order.model';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../_common/route/route-component';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { useAccountRouteController } from '../../RouteDashAccount.vue';
export default {
	...defineAppRouteOptions({
		cache: true,
		deps: {},
		resolver: () => Api.sendRequest('/web/dash/purchases'),
	}),
};
</script>

<script lang="ts" setup>
const { heading } = useAccountRouteController()!;

const orders = ref<OrderModel[]>([]);

const { isBootstrapped } = createAppRoute({
	routeTitle: heading,
	onInit() {
		heading.value = $gettext(`Order History`);
	},
	onResolved({ payload }) {
		orders.value = OrderModel.populate(payload.orders);
	},
});
</script>

<template>
	<div v-if="isBootstrapped">
		<table v-if="orders.length" class="table">
			<thead>
				<tr>
					<th>
						{{ $gettext(`Order #`) }}
					</th>
					<th>{{ $gettext(`Item(s)`) }}</th>
					<th>{{ $gettext(`Purchase Date`) }}</th>
					<th class="text-right">
						{{ $gettext(`Amount`) }}
					</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="order of orders" :key="order.id">
					<td>
						<strong>
							<RouterLink
								:to="{
									name: 'dash.account.purchases.view',
									params: { hash: order.hash },
								}"
							>
								{{ order.id }}
							</RouterLink>
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
							{{ $gettext(`Refunded`) }}
						</span>
						{{ formatCurrency(order.total_amount) }}
					</td>
				</tr>
			</tbody>
		</table>
		<div v-else class="row">
			<div class="col-md-6 col-centered">
				<p class="lead text-center">
					{{
						$gettext(
							`You haven't bought any games on the site yet. Once you do, you'll be able to see all of your orders here and the details for each order.`
						)
					}}
				</p>
			</div>
		</div>
	</div>
</template>
