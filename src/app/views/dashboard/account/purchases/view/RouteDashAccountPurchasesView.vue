<script lang="ts">
import { Ref, computed, ref } from 'vue';
import { Api } from '../../../../../../_common/api/api.service';
import { formatCurrency } from '../../../../../../_common/filters/currency';
import { formatDate } from '../../../../../../_common/filters/date';
import { GamePackageModel } from '../../../../../../_common/game/package/package.model';
import { Geo } from '../../../../../../_common/geo/geo.service';
import AppMicrotransactionItem from '../../../../../../_common/microtransaction/AppMicrotransactionItem.vue';
import { MicrotransactionProductModel } from '../../../../../../_common/microtransaction/product.model';
import { OrderModel } from '../../../../../../_common/order/order.model';
import { OrderPaymentMethod } from '../../../../../../_common/order/payment/payment.model';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../_common/route/route-component';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { useAccountRouteController } from '../../RouteDashAccount.vue';
import AppGamePackagePreview from './AppGamePackagePreview.vue';

export default {
	...defineAppRouteOptions({
		deps: { params: ['hash'] },
		resolver: ({ route }) => Api.sendRequest('/web/dash/purchases/order/' + route.params.hash),
	}),
};
</script>

<script lang="ts" setup>
const { heading } = useAccountRouteController()!;

const order = ref(null) as Ref<OrderModel | null>;

const firstRefund = computed(() => {
	if (
		order.value &&
		order.value._is_refunded &&
		order.value.payments &&
		order.value.payments[0] &&
		order.value.payments[0].refunds
	) {
		return order.value.payments[0].refunds[0];
	}
	return null;
});

const billingAddress = computed(() => order.value?.billing_address);

const hasVisiblePayment = computed(() => {
	if (!order.value || !order.value.payments || !order.value.payments.length) {
		return false;
	}

	return order.value.payments.some(
		i => i.method !== OrderPaymentMethod.CCStripe || !!i.stripe_payment_source
	);
});

const { isBootstrapped } = createAppRoute({
	routeTitle: heading,
	onInit() {
		heading.value = $gettext(`Order details`);
	},
	onResolved({ payload }) {
		order.value = new OrderModel(payload.order);
	},
});

function isGamePackage(
	resource: GamePackageModel | MicrotransactionProductModel | null
): resource is GamePackageModel {
	return resource instanceof GamePackageModel;
}

function isMicrotransactionProduct(resource: any): resource is MicrotransactionProductModel {
	return resource instanceof MicrotransactionProductModel;
}
</script>

<template>
	<div v-if="isBootstrapped && order">
		<p class="text-muted">
			{{ $gettextInterpolate(`Order #%{ orderId }`, { orderId: order.id }) }}

			<span class="dot-separator" />

			{{
				$gettextInterpolate(`Ordered on %{ date }`, {
					date: formatDate(order.completed_on, 'medium'),
				})
			}}
		</p>

		<!--
			If the order was canceled but without a refund (just disabled), then we can't show
			this.
		 -->
		<div v-if="order && order._is_refunded && firstRefund" class="alert alert-notice">
			{{
				$gettextInterpolate(`This order was refunded on %{ date }.`, {
					date: formatDate(firstRefund.created_on, 'medium'),
				})
			}}
		</div>

		<hr />

		<div class="row">
			<div v-if="billingAddress" class="col-sm-4">
				<h4 class="section-header">
					{{ $gettext(`Billing`) }}
				</h4>

				<div v-if="billingAddress.fullname">
					<strong>{{ billingAddress.fullname }}</strong>
				</div>

				<div v-if="billingAddress.street1">
					{{ billingAddress.street1 }}
				</div>

				<div v-if="billingAddress.street2">
					{{ billingAddress.street2 }}
				</div>

				<div>
					<template v-if="billingAddress.city">
						{{ billingAddress.city + ' ' }}
					</template>
					<template v-if="billingAddress.region && billingAddress.country">
						{{
							(Geo.getRegionName(billingAddress.country, billingAddress.region) ||
								billingAddress.region) + ' '
						}}
					</template>
					<template v-if="billingAddress.postcode">
						{{ billingAddress.postcode + ' ' }}
					</template>
				</div>

				<div v-if="billingAddress.country">
					{{ Geo.getCountryName(billingAddress.country) }}
				</div>
				<br />
			</div>
			<div v-if="hasVisiblePayment" class="col-sm-4">
				<h4 :class="{ 'section-header': !Screen.isXs }">
					{{ $gettext(`Payment`) }}
				</h4>
				<div v-for="payment of order.payments" :key="payment.id">
					<template
						v-if="
							payment.method === OrderPaymentMethod.CCStripe &&
							payment.stripe_payment_source
						"
					>
						<span class="tag">
							{{ payment.stripe_payment_source.brand }}
						</span>
						****
						{{ payment.stripe_payment_source.last4 }}
					</template>
					<template v-else-if="payment.method === OrderPaymentMethod.Paypal">
						<span class="tag"> PayPal </span>
						{{ payment.paypal_email_address }}
					</template>
					<template v-else-if="payment.method === OrderPaymentMethod.Wallet">
						<span class="tag"> Wallet </span>
						{{ formatCurrency(payment.amount) }}
					</template>
				</div>
			</div>
			<div class="col-sm-4">
				<h4 :class="{ 'section-header': !Screen.isXs }">
					{{ $gettext(`Summary`) }}
				</h4>

				<table class="-summary-table">
					<tbody>
						<tr>
							<th>
								{{ $gettext(`Subtotal`) }}
							</th>
							<td>
								{{ formatCurrency(order.amount) }}
							</td>
						</tr>
						<tr v-if="order.tax_amount">
							<th>
								{{ $gettext(`Tax`) }}
							</th>
							<td>{{ formatCurrency(order.tax_amount) }}</td>
						</tr>
					</tbody>
					<tfoot>
						<tr>
							<th>
								{{ $gettext(`Total`) }}
							</th>
							<td>{{ formatCurrency(order.total_amount) }}</td>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>

		<hr />

		<div v-for="item of order.items" :key="item.id">
			<h4>
				<span v-if="item.is_refunded" class="tag tag-notice">
					{{ $gettext(`Refunded`) }}
				</span>
				{{ item.sellable.title }}
				&mdash;
				<small>{{ formatCurrency(item.amount) }}</small>
			</h4>

			<template v-if="isGamePackage(item.sellable.resource_model)">
				<AppGamePackagePreview
					v-if="item.sellable.resource_model.game"
					:game="item.sellable.resource_model.game"
					:game-package="item.sellable.resource_model"
				/>
			</template>
			<template v-else-if="isMicrotransactionProduct(item.sellable.resource_model)">
				<AppMicrotransactionItem :item="item.sellable.resource_model" />
			</template>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-summary-table
	width: 100%

	tbody > th
		font-weight: normal

	tfoot > tr
		& > th
		& > td
			font-weight: bold
</style>
