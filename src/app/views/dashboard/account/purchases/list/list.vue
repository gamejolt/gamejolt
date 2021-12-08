<script lang="ts" src="./list"></script>

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
					<td :title="date(order.completed_on, 'medium')">
						{{ date(order.completed_on, 'mediumDate') }}
					</td>
					<td class="text-right">
						<span v-if="order._is_refunded" class="tag tag-notice">
							<translate>Refunded</translate>
						</span>
						{{ currency(order.total_amount) }}
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
