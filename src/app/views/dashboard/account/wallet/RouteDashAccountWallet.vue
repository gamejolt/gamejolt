<script lang="ts">
import { computed, ref } from 'vue';
import AppAlertBox from '../../../../../_common/alert/AppAlertBox.vue';
import { Api } from '../../../../../_common/api/api.service';
import AppButton from '../../../../../_common/button/AppButton.vue';
import AppCard from '../../../../../_common/card/AppCard.vue';
import AppExpand from '../../../../../_common/expand/AppExpand.vue';
import { formatCurrency } from '../../../../../_common/filters/currency';
import { formatNumber } from '../../../../../_common/filters/number';
import AppJolticon from '../../../../../_common/jolticon/AppJolticon.vue';
import AppProgressBar from '../../../../../_common/progress/AppProgressBar.vue';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import AppSpacer from '../../../../../_common/spacer/AppSpacer.vue';
import { vAppTooltip } from '../../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { UserWallet } from '../../../../../_common/user/wallet/wallet.model';
import { showWalletWithdrawModal } from '../../../../components/wallet/withdraw/withdraw-modal.service';
import { imageGems } from '../../../../img/images';
import { useAccountRouteController } from '../RouteDashAccount.vue';
import marketplaceImage from './marketplace.png';

export default {
	...defineAppRouteOptions({
		deps: {},
		resolver: () =>
			Api.sendFieldsRequest('/mobile/me', {
				marketplaceWalletBalance: true,
				marketplaceRevenueTotal: true,
				marketplaceRevenueWithdrawn: true,
				marketplaceRevenueSpent: true,
				marketplaceRevenueCurrent: true,
				marketplaceRevenuePendingWithdraw: true,
				marketplaceRevenuePendingActivation: true,
				gemWallet: true,
			}),
	}),
};
</script>

<script lang="ts" setup>
const { heading } = useAccountRouteController()!;

const marketplaceWalletBalance = ref(0);
const marketplaceRevenueTotal = ref(0);
const marketplaceRevenueWithdrawn = ref(0);
const marketplaceRevenueSpent = ref(0);
const marketplaceRevenueCurrent = ref(0);
const marketplaceRevenuePendingWithdraw = ref(0);
const marketplaceRevenuePendingActivation = ref(0);
const gemWallet = ref<UserWallet>();

const isShowingRevenueBreakdown = ref(false);

const routeTitle = computed(() => $gettext(`Wallet`));
const gemsProgress = computed(() => {
	return gemWallet.value &&
		gemWallet.value.minimum_payout_balance &&
		gemWallet.value.available_balance
		? Math.min(
				(gemWallet.value.available_balance / gemWallet.value.minimum_payout_balance) * 100,
				100
		  )
		: 0;
});

const { isBootstrapped, reload } = createAppRoute({
	routeTitle,
	onInit() {
		heading.value = routeTitle.value;
	},
	onResolved({ payload }) {
		marketplaceRevenueTotal.value = payload.marketplaceRevenueTotal || 0;
		marketplaceRevenueWithdrawn.value = payload.marketplaceRevenueWithdrawn || 0;
		marketplaceRevenueSpent.value = payload.marketplaceRevenueSpent || 0;
		marketplaceRevenueCurrent.value = payload.marketplaceRevenueCurrent || 0;
		marketplaceRevenuePendingWithdraw.value = payload.marketplaceRevenuePendingWithdraw || 0;
		marketplaceRevenuePendingActivation.value =
			payload.marketplaceRevenuePendingActivation || 0;
		marketplaceWalletBalance.value = payload.marketplaceWalletBalance || 0;

		gemWallet.value = payload.gemWallet ? new UserWallet(payload.gemWallet) : undefined;
	},
});

async function withdraw() {
	await showWalletWithdrawModal();
	reload();
}
</script>

<template>
	<div v-if="isBootstrapped" class="row">
		<div class="col-md-9 col-lg-8">
			<template v-if="!gemWallet && !marketplaceRevenueTotal">
				<p class="lead text-center">
					<AppTranslate>
						Once you make money on Game Jolt, you will be able to withdraw it here.
					</AppTranslate>
				</p>
			</template>

			<template v-if="gemWallet">
				<AppCard>
					<div class="-wallet-title">
						<img
							class="-wallet-icon"
							:src="imageGems"
							width="32"
							height="32"
							alt="Gems Wallet Icon"
						/>
						<AppTranslate>Gems</AppTranslate>
					</div>

					<AppSpacer vertical :scale="4" />

					<div class="-wallet-content">
						<div class="row">
							<div class="col-xs-6 col-sm-4">
								<div class="stat-big stat-big-smaller">
									<div class="stat-big-label">
										<AppTranslate>Gems balance</AppTranslate>
									</div>
									<div class="stat-big-digit">
										{{ formatNumber(gemWallet.available_balance) }}
									</div>
								</div>
							</div>
							<div class="col-xs-6 col-sm-4">
								<div class="stat-big stat-big-smaller">
									<div class="stat-big-label">
										<AppTranslate>Pending gems</AppTranslate>
									</div>
									<div class="stat-big-digit">
										{{ formatNumber(gemWallet.pending_balance) }}
										<AppJolticon
											v-app-tooltip.touchable="
												$gettext(
													`To account for potential refunds, chargebacks, and fraud we hold on to revenue for 7 days.`
												)
											"
											class="text-muted"
											icon="help-circle"
										/>
									</div>
								</div>
							</div>
						</div>

						<template
							v-if="gemWallet.available_balance >= gemWallet.minimum_payout_balance"
						>
							<AppSpacer vertical :scale="2" />
							<AppAlertBox icon="thumbs-up" color="highlight">
								<AppTranslate>
									Party time! 🎆 🤸 You've reached the minimum withdrawal amount.
									We'll be depositing your gems into your preferred payment method
									within the first 15 days of next month.
								</AppTranslate>
							</AppAlertBox>
						</template>
						<template v-else>
							<AppProgressBar :percent="gemsProgress" thin />

							<div
								style="
									display: flex;
									flex-direction: row;
									grid-gap: 24px;
									font-size: 13px;
								"
							>
								<div>
									<AppTranslate>
										Once you reach the minimum withdrawal amount, we'll deposit
										your gems through your preferred payment method within the
										first 15 days of the following month.
									</AppTranslate>
								</div>
								<div style="flex: auto" />
								<div style="flex: none">
									<strong>
										{{ gemWallet.available_balance }} /
										{{ gemWallet.minimum_payout_balance }}
									</strong>
								</div>
							</div>
						</template>
					</div>
				</AppCard>
			</template>

			<template v-if="marketplaceRevenueTotal > 0">
				<AppCard>
					<div class="-wallet-title">
						<img
							class="-wallet-icon"
							:src="marketplaceImage"
							width="32"
							height="32"
							alt="Marketplace Wallet Icon"
						/>
						<AppTranslate>Marketplace</AppTranslate>
					</div>

					<AppSpacer vertical :scale="4" />

					<div class="-wallet-content">
						<div class="row">
							<div class="col-xs-6 col-sm-4">
								<div class="stat-big stat-big-smaller">
									<div class="stat-big-label">
										<AppTranslate>Wallet balance</AppTranslate>
									</div>
									<div class="stat-big-digit">
										{{ formatCurrency(marketplaceWalletBalance) }}
									</div>
								</div>
							</div>
							<div class="col-xs-6 col-sm-4">
								<div class="stat-big stat-big-smaller">
									<div class="stat-big-label">
										<AppTranslate>Pending revenue</AppTranslate>
									</div>
									<div class="stat-big-digit">
										{{ formatCurrency(marketplaceRevenuePendingActivation) }}
										<AppJolticon
											v-app-tooltip.touchable="
												$gettext(
													`To account for refunds, chargebacks, and fraud we hold on to sales revenue for 7 days.`
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
										<AppTranslate>Revenue to date</AppTranslate>
									</div>
									<div class="stat-big-digit">
										{{ formatCurrency(marketplaceRevenueTotal) }}
									</div>
								</div>
							</div>
						</div>

						<AppExpand :when="isShowingRevenueBreakdown">
							<AppSpacer vertical :scale="6" />

							<table class="table table-condensed">
								<tbody>
									<tr>
										<th><AppTranslate>Revenue to date</AppTranslate></th>
										<td class="text-right">
											{{ formatCurrency(marketplaceRevenueTotal) }}
										</td>
									</tr>
									<tr>
										<th><AppTranslate>Pending revenue</AppTranslate></th>
										<td class="text-right">
											{{
												formatCurrency(marketplaceRevenuePendingActivation)
											}}
										</td>
									</tr>
									<tr>
										<th><AppTranslate>Total revenue</AppTranslate></th>
										<td class="text-right">
											{{
												formatCurrency(
													marketplaceRevenueTotal +
														marketplaceRevenuePendingActivation
												)
											}}
										</td>
									</tr>
								</tbody>
							</table>

							<table class="table table-condensed">
								<tbody>
									<tr>
										<th>
											<AppTranslate>Withdrawals processing</AppTranslate>
										</th>
										<td class="text-right">
											{{ formatCurrency(marketplaceRevenuePendingWithdraw) }}
										</td>
									</tr>
									<tr>
										<th><AppTranslate>Withdrawn to date</AppTranslate></th>
										<td class="text-right">
											{{ formatCurrency(marketplaceRevenueWithdrawn) }}
										</td>
									</tr>
								</tbody>
							</table>
							<table class="table table-condensed sans-margin-bottom">
								<tbody>
									<tr>
										<th><AppTranslate>Wallet purchases</AppTranslate></th>
										<td class="text-right">
											{{ formatCurrency(marketplaceRevenueSpent) }}
										</td>
									</tr>
									<tr>
										<th><AppTranslate>Wallet balance</AppTranslate></th>
										<td class="text-right">
											{{ formatCurrency(marketplaceWalletBalance) }}
										</td>
									</tr>
								</tbody>
							</table>

							<AppSpacer vertical :scale="8" />
						</AppExpand>

						<div>
							<a @click="isShowingRevenueBreakdown = !isShowingRevenueBreakdown">
								<AppTranslate v-if="!isShowingRevenueBreakdown">
									Show details
								</AppTranslate>
								<AppTranslate v-else>Hide details</AppTranslate>
							</a>
						</div>

						<AppSpacer vertical :scale="6" />

						<AppButton primary block @click="withdraw()">
							<AppTranslate>Withdraw funds</AppTranslate>
						</AppButton>
					</div>
				</AppCard>
			</template>

			<AppAlertBox v-if="marketplaceRevenuePendingWithdraw > 0" color="highlight">
				<div v-translate="{ amount: formatCurrency(marketplaceRevenuePendingWithdraw) }">
					You have pending withdrawals amounting to
					<b>%{ amount }</b>.
				</div>
			</AppAlertBox>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-wallet-title
	font-family: $font-family-heading
	font-size: 25px
	font-weight: bold
	display: flex
	align-items: center

.-wallet-icon
	margin-right: 8px
</style>
