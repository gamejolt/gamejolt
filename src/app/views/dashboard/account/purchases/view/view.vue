<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../../_common/api/api.service';
import { formatCurrency } from '../../../../../../_common/filters/currency';
import { formatDate } from '../../../../../../_common/filters/date';
import AppGameThumbnailImg from '../../../../../../_common/game/thumbnail/AppGameThumbnailImg.vue';
import { Geo } from '../../../../../../_common/geo/geo.service';
import { Order } from '../../../../../../_common/order/order.model';
import { OrderPayment } from '../../../../../../_common/order/payment/payment.model';
import {
	BaseRouteComponent,
	OptionsForRoute,
} from '../../../../../../_common/route/route-component';
import { Screen } from '../../../../../../_common/screen/screen-service';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import { useAccountRouteController } from '../../RouteDashAccount.vue';
import AppGamePackagePreview from './AppGamePackagePreview.vue';

@Options({
	name: 'RouteDashAccountPurchasesView',
	components: {
		AppGameThumbnailImg,
		AppGamePackagePreview,
	},
})
@OptionsForRoute({
	deps: { params: ['hash'] },
	resolver: ({ route }) => Api.sendRequest('/web/dash/purchases/order/' + route.params.hash),
})
export default class RouteDashAccountPurchasesView extends BaseRouteComponent {
	routeStore = setup(() => useAccountRouteController()!);

	order: Order = null as any;

	readonly Geo = Geo;
	readonly OrderPayment = OrderPayment;
	readonly formatDate = formatDate;
	readonly formatCurrency = formatCurrency;
	readonly Screen = Screen;

	get routeTitle() {
		return this.routeStore.heading;
	}

	get firstRefund() {
		if (
			this.order._is_refunded &&
			this.order.payments &&
			this.order.payments[0] &&
			this.order.payments[0].refunds
		) {
			return this.order.payments[0].refunds[0];
		}
		return null;
	}

	get billingAddress() {
		return this.order.billing_address!;
	}

	routeCreated() {
		this.routeStore.heading = $gettext(`Order Details`);
	}

	routeResolved($payload: any) {
		this.order = new Order($payload.order);
	}
}
</script>

<template>
	<div v-if="isRouteBootstrapped">
		<p class="text-muted">
			<AppTranslate :translate-params="{ orderId: order.id }">
				Order #%{orderId}
			</AppTranslate>

			<span class="dot-separator" />

			<AppTranslate :translate-params="{ date: formatDate(order.completed_on, 'medium') }">
				Ordered on %{date}
			</AppTranslate>
		</p>

		<!--
			If the order was canceled but without a refund (just disabled), then we can't show
			this.
		-->
		<div v-if="order._is_refunded && firstRefund" class="alert alert-notice">
			<AppTranslate
				:translate-params="{
					date: formatDate(firstRefund.created_on, 'medium'),
				}"
			>
				This order was refunded on %{ date }.
			</AppTranslate>
		</div>

		<hr />

		<div class="row">
			<div v-if="billingAddress" class="col-sm-4">
				<h4 class="section-header">
					<AppTranslate>Billing</AppTranslate>
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
			<div class="col-sm-4">
				<h4 :class="{ 'section-header': !Screen.isXs }">
					<AppTranslate>Payment</AppTranslate>
				</h4>
				<div v-for="payment of order.payments" :key="payment.id">
					<template v-if="payment.method === OrderPayment.METHOD_CC_STRIPE">
						<span class="tag">
							{{ payment.stripe_payment_source.brand }}
						</span>
						****
						{{ payment.stripe_payment_source.last4 }}
					</template>
					<template v-else-if="payment.method === OrderPayment.METHOD_PAYPAL">
						<span class="tag"> PayPal </span>
						{{ payment.paypal_email_address }}
					</template>
					<template v-else-if="payment.method === OrderPayment.METHOD_WALLET">
						<span class="tag"> Wallet </span>
						{{ formatCurrency(payment.amount) }}
					</template>
				</div>
			</div>
			<div class="col-sm-4">
				<h4 :class="{ 'section-header': !Screen.isXs }">
					<AppTranslate>Summary</AppTranslate>
				</h4>

				<table class="-summary-table">
					<tbody>
						<tr>
							<th><AppTranslate>Subtotal</AppTranslate></th>
							<td>{{ formatCurrency(order.amount) }}</td>
						</tr>
						<tr v-if="order.tax_amount">
							<th><AppTranslate>Tax</AppTranslate></th>
							<td>{{ formatCurrency(order.tax_amount) }}</td>
						</tr>
					</tbody>
					<tfoot>
						<tr>
							<th><AppTranslate>Total</AppTranslate></th>
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
					<AppTranslate>Refunded</AppTranslate>
				</span>
				{{ item.sellable.title }}
				&mdash;
				<small>{{ formatCurrency(item.amount) }}</small>
			</h4>

			<template v-if="item.sellable.resource_type === 'Game_Package'">
				<AppGamePackagePreview
					:game="item.sellable.resource_model.game"
					:game-package="item.sellable.resource_model"
				/>
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
