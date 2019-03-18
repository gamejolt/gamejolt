<template>
	<div class="row" v-if="isRouteBootstrapped">
		<div v-if="revenueTotal > 0" class="col-md-9 col-lg-8">
			<div class="row">
				<div class="col-xs-6 col-sm-4">
					<div class="stat-big stat-big-smaller">
						<div class="stat-big-label">
							<translate>Revenue To Date</translate>
						</div>
						<div class="stat-big-digit">
							<a @click="isShowingRevenueBreakdown = !isShowingRevenueBreakdown">
								{{ revenueTotal | currency }}
							</a>
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-4">
					<div class="stat-big stat-big-smaller">
						<div class="stat-big-label">
							<translate>Pending Revenue</translate>
						</div>
						<div class="stat-big-digit">
							{{ revenuePendingActivation | currency }}
							<app-jolticon
								class="text-muted"
								icon="help-circle"
								v-app-tooltip="
									$gettext(
										`To account for refunds, chargebacks, and fraud, we hold on to sales revenue for 7 days.`
									)
								"
							/>
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-4">
					<div class="stat-big stat-big-smaller">
						<div class="stat-big-label">
							<translate>Wallet Balance</translate>
						</div>
						<div class="stat-big-digit">{{ walletBalance | currency }}</div>
					</div>
				</div>
			</div>
			<br />

			<app-expand :when="isShowingRevenueBreakdown">
				<div class="well fill-offset">
					<table class="table table-condensed">
						<tbody>
							<tr>
								<th><translate>Revenue To Date</translate></th>
								<td class="text-right">{{ revenueTotal | currency }}</td>
							</tr>
							<tr>
								<th><translate>Pending Revenue</translate></th>
								<td class="text-right">{{ revenuePendingActivation | currency }}</td>
							</tr>
							<tr>
								<th><translate>Total Revenue</translate></th>
								<td class="text-right">
									{{ (revenueTotal + revenuePendingActivation) | currency }}
								</td>
							</tr>
						</tbody>
					</table>

					<table class="table table-condensed">
						<tbody>
							<tr>
								<th><translate>Withdrawals Processing</translate></th>
								<td class="text-right">{{ revenuePendingWithdraw | currency }}</td>
							</tr>
							<tr>
								<th><translate>Withdrawn To Date</translate></th>
								<td class="text-right">{{ revenueWithdrawn | currency }}</td>
							</tr>
						</tbody>
					</table>
					<table class="table table-condensed sans-margin-bottom">
						<tbody>
							<tr>
								<th><translate>Wallet Purchases</translate></th>
								<td class="text-right">{{ revenueSpent | currency }}</td>
							</tr>
							<tr>
								<th><translate>Wallet Balance</translate></th>
								<td class="text-right">{{ walletBalance | currency }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</app-expand>

			<div v-if="revenuePendingWithdraw > 0" class="alert alert-info">
				<p v-translate="{ amount: currency(revenuePendingWithdraw) }">
					You have pending withdrawals amounting to
					<b>%{ amount }</b>
					.
				</p>
			</div>

			<div v-if="revenuePending" class="alert alert-info">
				<p v-translate="{ amount: currency(revenuePending) }">
					You currently have
					<b>%{ amount }</b>
					pending withdrawal.
				</p>
			</div>

			<div v-translate>dash.funds.withdraw.page_help_html</div>

			<form-withdraw-funds
				:user="user"
				:paypal-email="email"
				:min-amount="minAmount"
				:withdrawable-amount="walletBalance / 100"
				@submit="onSubmit()"
			/>
		</div>
		<div class="col-md-6 col-centered" v-else>
			<p class="lead text-center">
				<translate>
					Once you make money on Game Jolt, you will be able to withdraw it here.
				</translate>
			</p>
		</div>
	</div>
</template>

<script lang="ts" src="./withdraw-funds" />
