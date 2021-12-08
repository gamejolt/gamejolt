<script lang="ts" src="./view"></script>

<template>
	<div v-if="isRouteBootstrapped">
		<p class="text-muted">
			<translate :translate-params="{ orderId: order.id }"> Order #%{orderId} </translate>

			<span class="dot-separator" />

			<translate :translate-params="{ date: date(order.completed_on, 'medium') }">
				Ordered on %{date}
			</translate>
		</p>

		<!--
			If the order was canceled but without a refund (just disabled), then we can't show
			this.
		-->
		<div v-if="order._is_refunded && firstRefund" class="alert alert-notice">
			<translate
				:translate-params="{
					date: date(firstRefund.created_on, 'medium'),
				}"
			>
				This order was refunded on %{ date }.
			</translate>
		</div>

		<hr />

		<div class="row">
			<div class="col-sm-4">
				<h4 class="section-header">
					<translate>Billing</translate>
				</h4>

				<div v-for="(address, i) of [order.billing_address]" :key="i">
					<div v-if="address.fullname">
						<strong>{{ address.fullname }}</strong>
					</div>

					<div v-if="address.street1">
						{{ address.street1 }}
					</div>

					<div v-if="address.street2">
						{{ address.street2 }}
					</div>

					<div>
						<template v-if="address.city">
							{{ address.city }}
						</template>
						<template v-if="address.region">
							{{
								Geo.getRegionName(address.country, address.region) || address.region
							}}
						</template>
						<template v-if="address.postcode">
							{{ address.postcode }}
						</template>
					</div>

					<div v-if="address.country">
						{{ Geo.getCountryName(address.country) }}
					</div>
				</div>
				<br />
			</div>
			<div class="col-sm-4">
				<h4 :class="{ 'section-header': !Screen.isXs }">
					<translate>Payment</translate>
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
						{{ currency(payment.amount) }}
					</template>
				</div>
			</div>
			<div class="col-sm-4">
				<h4 :class="{ 'section-header': !Screen.isXs }">
					<translate>Summary</translate>
				</h4>

				<table class="-summary-table">
					<tbody>
						<tr>
							<th><translate>Subtotal</translate></th>
							<td>{{ currency(order.amount) }}</td>
						</tr>
						<tr v-if="order.tax_amount">
							<th><translate>Tax</translate></th>
							<td>{{ currency(order.tax_amount) }}</td>
						</tr>
					</tbody>
					<tfoot>
						<tr>
							<th><translate>Total</translate></th>
							<td>{{ currency(order.total_amount) }}</td>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>

		<hr />

		<div v-for="item of order.items" :key="item.id">
			<h4>
				<span v-if="item.is_refunded" class="tag tag-notice">
					<translate>Refunded</translate>
				</span>
				{{ item.sellable.title }}
				&mdash;
				<small>{{ currency(item.amount) }}</small>
			</h4>

			<div
				v-for="firstPackage of [packagesBySellable[item.sellable.id][0]]"
				:key="firstPackage.id"
			>
				<div class="row">
					<div class="col-xs-2">
						<router-link
							style="display: block"
							:to="{
								name: 'discover.games.view.overview',
								params: {
									slug: gamesById[firstPackage.game_id].slug,
									id: firstPackage.game_id,
								},
							}"
						>
							<app-game-thumbnail-img
								animate
								:game="gamesById[firstPackage.game_id]"
							/>
						</router-link>
					</div>
					<div class="col-xs-10">
						<p>
							<router-link
								:to="{
									name: 'discover.games.view.overview',
									params: {
										slug: gamesById[firstPackage.game_id].slug,
										id: firstPackage.game_id,
									},
								}"
							>
								{{ gamesById[firstPackage.game_id].title }}
							</router-link>
							<br />
							<span class="small">
								<translate>by</translate>
								<router-link
									:to="{
										name: 'profile.overview',
										params: {
											username:
												gamesById[firstPackage.game_id].developer.username,
										},
									}"
								>
									{{ gamesById[firstPackage.game_id].developer.display_name }}
								</router-link>
							</span>
						</p>

						<p />

						<h5 class="sans-margin">
							<translate>Packages</translate>
						</h5>

						<div class="small text-muted">
							<div v-for="pkg of packagesBySellable[item.sellable.id]" :key="pkg.id">
								- {{ pkg.title || gamesById[pkg.game_id].title }}
							</div>
						</div>
					</div>
				</div>

				<br />
			</div>
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
