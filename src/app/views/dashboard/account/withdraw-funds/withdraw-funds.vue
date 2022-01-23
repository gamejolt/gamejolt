<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import AppExpand from '../../../../../_common/expand/AppExpand.vue';
import { formatCurrency } from '../../../../../_common/filters/currency';
import { formatNumber } from '../../../../../_common/filters/number';
import { showSuccessGrowl } from '../../../../../_common/growls/growls.service';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { Screen } from '../../../../../_common/screen/screen-service';
import { AppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { User } from '../../../../../_common/user/user.model';
import FormWithdrawFunds from '../../../../components/forms/withdraw-funds/withdraw-funds.vue';
import { useAccountRouteController } from '../account.vue';

@Options({
	name: 'RouteDashAccountWithdrawFunds',
	components: {
		FormWithdrawFunds,
		AppExpand,
	},
	directives: {
		AppTooltip,
	},
})
@RouteResolver({
	deps: {},
	resolver: () => Api.sendRequest('/web/dash/funds'),
})
export default class RouteDashAccountWithdrawFunds extends BaseRouteComponent {
	routeStore = setup(() => useAccountRouteController()!);

	user: User = null as any;
	minAmount = 0;
	revenueTotal = 0;
	revenueWithdrawn = 0;
	revenueSpent = 0;
	revenueCurrent = 0;
	revenuePending = 0;
	revenuePendingWithdraw = 0;
	revenuePendingActivation = 0;
	walletBalance = 0;
	email = '';
	isShowingRevenueBreakdown = false;

	readonly Screen = Screen;
	readonly formatCurrency = formatCurrency;
	readonly formatNumber = formatNumber;

	get routeTitle() {
		return this.routeStore.heading;
	}

	routeCreated() {
		this.routeStore.heading = $gettext(`dash.funds.withdraw.page_title`);
	}

	routeResolved($payload: any) {
		this.user = new User($payload.user);
		this.minAmount = $payload.minAmount || 0;
		this.revenueTotal = $payload.revenueTotal || 0;
		this.revenueWithdrawn = $payload.revenueWithdrawn || 0;
		this.revenueSpent = $payload.revenueSpent || 0;
		this.revenueCurrent = $payload.revenueCurrent || 0;
		this.revenuePendingWithdraw = $payload.revenuePendingWithdraw || 0;
		this.revenuePendingActivation = $payload.revenuePendingActivation || 0;
		this.walletBalance = $payload.walletBalance || 0;
		this.email = $payload.email || '';
	}

	onSubmit() {
		showSuccessGrowl(
			this.$gettext('dash.funds.withdraw.success_growl'),
			this.$gettext('dash.funds.withdraw.success_growl_title')
		);

		this.$router.push({ name: 'home' });
	}
}
</script>

<template>
	<div v-if="isRouteBootstrapped" class="row">
		<div v-if="revenueTotal > 0" class="col-md-9 col-lg-8">
			<div class="row">
				<div class="col-xs-6 col-sm-4">
					<div class="stat-big stat-big-smaller">
						<div class="stat-big-label">
							<translate>Revenue To Date</translate>
						</div>
						<div class="stat-big-digit">
							<a @click="isShowingRevenueBreakdown = !isShowingRevenueBreakdown">
								{{ formatCurrency(revenueTotal) }}
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
							{{ formatCurrency(revenuePendingActivation) }}
							<app-jolticon
								v-app-tooltip.touchable="
									$gettext(
										`To account for refunds, chargebacks, and fraud, we hold on to sales revenue for 7 days.`
									)
								"
								class="text-muted"
								icon="help-circle"
							/>
						</div>
					</div>
				</div>
				<div class="col-xs-6 col-sm-4">
					<div class="stat-big stat-big-smaller">
						<div class="stat-big-label">
							<translate>Wallet Balance</translate>
						</div>
						<div class="stat-big-digit">{{ formatCurrency(walletBalance) }}</div>
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
								<td class="text-right">{{ formatCurrency(revenueTotal) }}</td>
							</tr>
							<tr>
								<th><translate>Pending Revenue</translate></th>
								<td class="text-right">
									{{ formatCurrency(revenuePendingActivation) }}
								</td>
							</tr>
							<tr>
								<th><translate>Total Revenue</translate></th>
								<td class="text-right">
									{{ formatCurrency(revenueTotal + revenuePendingActivation) }}
								</td>
							</tr>
						</tbody>
					</table>

					<table class="table table-condensed">
						<tbody>
							<tr>
								<th><translate>Withdrawals Processing</translate></th>
								<td class="text-right">
									{{ formatCurrency(revenuePendingWithdraw) }}
								</td>
							</tr>
							<tr>
								<th><translate>Withdrawn To Date</translate></th>
								<td class="text-right">{{ formatCurrency(revenueWithdrawn) }}</td>
							</tr>
						</tbody>
					</table>
					<table class="table table-condensed sans-margin-bottom">
						<tbody>
							<tr>
								<th><translate>Wallet Purchases</translate></th>
								<td class="text-right">{{ formatCurrency(revenueSpent) }}</td>
							</tr>
							<tr>
								<th><translate>Wallet Balance</translate></th>
								<td class="text-right">{{ formatCurrency(walletBalance) }}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</app-expand>

			<div v-if="revenuePendingWithdraw > 0" class="alert alert-info">
				<p v-translate="{ amount: formatCurrency(revenuePendingWithdraw) }">
					You have pending withdrawals amounting to
					<b>%{ amount }</b>
					.
				</p>
			</div>

			<div v-if="revenuePending" class="alert alert-info">
				<p v-translate="{ amount: formatCurrency(revenuePending) }">
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
		<div v-else class="col-md-6 col-centered">
			<p class="lead text-center">
				<translate>
					Once you make money on Game Jolt, you will be able to withdraw it here.
				</translate>
			</p>
		</div>
	</div>
</template>
