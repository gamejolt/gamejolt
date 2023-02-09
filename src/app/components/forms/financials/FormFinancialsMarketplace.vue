<script lang="ts" setup>
import { computed, ref } from 'vue';
import { bangRef } from '../../../../utils/vue';
import AppAlertBox from '../../../../_common/alert/AppAlertBox.vue';
import { Api } from '../../../../_common/api/api.service';
import AppButton from '../../../../_common/button/AppButton.vue';
import { formatCurrency } from '../../../../_common/filters/currency';
import AppForm, { createForm, FormController } from '../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlError from '../../../../_common/form-vue/AppFormControlError.vue';
import AppFormControlErrors from '../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../_common/form-vue/AppFormGroup.vue';
import {
	validateMaxValue,
	validateMinValue,
	validatePattern,
} from '../../../../_common/form-vue/validators';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import { Navigate } from '../../../../_common/navigate/navigate.service';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import { UserStripeManagedAccount } from '../../../../_common/user/stripe-managed-account/stripe-managed-account';
import AppDeveloperTerms from './AppDeveloperTerms.vue';
import AppFinancialsCheckmark from './AppFinancialsCheckmark.vue';
import FormFinancialsManagedAccount from './managed-account/managed-account.vue';

interface FormModel {
	tos_type?: 'developer';
	wallet_maximum: number;
	payout_minimum: number;
	percentage_split: number;
}

const { user: maybeUser } = useCommonStore();
const user = bangRef(maybeUser);

const account = ref<UserStripeManagedAccount>();

const maxWallet = ref(0);
const maxPayout = ref(0);
const minWithdraw = ref(0);

const isVerified = computed(() => account.value && account.value.is_verified);

/**
 * If they have an account with TOS signed for a marketplace program. This deals
 * with real usd and is treated differently.
 */
const hasMarketplaceAccount = computed(
	() => account.value && account.value.tos_signed_developer > 0
);

const form: FormController<FormModel> = createForm({
	reloadOnSubmit: true,
	loadUrl: `/web/dash/financials/save`,
	onLoad(payload) {
		if (payload.user) {
			user.value.assign(payload.user);
		}

		account.value = payload.account ? new UserStripeManagedAccount(payload.account) : undefined;

		maxWallet.value = payload.maxWallet;
		maxPayout.value = payload.maxPayout;
		minWithdraw.value = payload.minWithdraw;

		form.formModel.wallet_maximum = user.value.revenue_wallet_maximum! / 100;
		form.formModel.payout_minimum = user.value.revenue_payout_minimum! / 100;
		form.formModel.percentage_split = 100 - user.value.revenue_percentage!;
	},
	onSubmit() {
		return Api.sendRequest('/web/dash/financials/save', form.formModel);
	},
	onSubmitError() {
		showErrorGrowl($gettext('Something went wrong.'));
	},
});

async function acceptTerms() {
	form.formModel.tos_type = 'developer';
	form.submit();
}

async function linkPayPal() {
	try {
		const response = await Api.sendRequest('/web/dash/financials/get-paypal-auth', null, {
			detach: true,
		});

		if (!response || !response.authUrl) {
			throw new Error(`Response does not have an 'authUrl' field`);
		}

		Navigate.gotoExternal(response.authUrl);
	} catch (err) {
		console.error(err);
		showErrorGrowl($gettext(`Could not get PayPal redirect URL.`));
	}
}
</script>

<template>
	<AppForm :controller="form" class="form-dashboard-financials">
		<template v-if="form.isLoadedBootstrapped">
			<template v-if="!isVerified">
				<AppAlertBox icon="notice" color="primary">
					<AppTranslate>
						Before you can earn money, we'll need to gather some details from you. This
						will ensure that your account is completely set up and ready to run
						smoothly.
					</AppTranslate>
				</AppAlertBox>
			</template>
			<template v-else>
				<AppAlertBox icon="check" color="primary">
					<AppTranslate>Your marketplace account is ready to go!</AppTranslate>
				</AppAlertBox>
			</template>
			<br />

			<AppDeveloperTerms :account="account" @accepted="acceptTerms()" />

			<!-- Once they accept the terms they can fill everything else out -->
			<template v-if="hasMarketplaceAccount">
				<fieldset v-if="account">
					<legend>
						<AppFinancialsCheckmark
							v-if="user.paypal_id"
							:tooltip="$gettext(`You have completed this section.`)"
						/>
						<AppTranslate>PayPal Account</AppTranslate>
					</legend>

					<div class="form-group">
						<p v-if="!user.paypal_id" class="small">
							<AppTranslate>
								In order to withdraw your revenue you will need to link a PayPal
								account.
							</AppTranslate>
						</p>

						<div v-if="user.paypal_id">
							<div>{{ user.paypal_email_address }}</div>
							<br />
						</div>

						<AppButton @click="linkPayPal()">
							<template v-if="!user.paypal_id">
								<AppTranslate>Link PayPal Account</AppTranslate>
							</template>
							<template v-else>
								<AppTranslate>Change PayPal Account</AppTranslate>
							</template>
						</AppButton>
					</div>
				</fieldset>

				<!-- They need to have PayPal linked before they can do this. -->
				<fieldset v-if="account && user.paypal_id">
					<legend>
						<AppFinancialsCheckmark
							v-if="isVerified"
							:tooltip="$gettext(`You have completed this section.`)"
						/>
						<AppTranslate>Account Information</AppTranslate>
					</legend>

					<!-- If they signed up for creator program, they don't need
					Stripe, but they do need us to verify -->
					<template v-if="account.skip_stripe">
						<div class="alert">
							<p>
								<AppTranslate>You're approved!</AppTranslate>
							</p>
						</div>
					</template>
					<template v-else>
						<FormFinancialsManagedAccount />
					</template>
				</fieldset>

				<!-- The next stuff only has to happen if they've signed up for
				one of the marketplace-type programs. -->
				<template v-if="isVerified">
					<!-- Only allow them to change percentage split if they are
					signed up as a dev. -->
					<fieldset v-if="account?.tos_signed_developer">
						<legend>
							<AppTranslate>Percentage Split</AppTranslate>
						</legend>

						<p v-translate class="small">
							You decide what percentage of your sale revenue to give to Game Jolt.
							<b>We won't let you give us more than 10%</b>
							because we'd rather have you support other developers by buying their
							games.
						</p>

						<AppFormGroup name="percentage_split" hide-label optional>
							<AppFormControl
								type="number"
								step="1"
								max="10"
								min="0"
								:validators="[
									validatePattern(/^\d+$/),
									validateMaxValue(10),
									validateMinValue(0),
								]"
							/>
							<AppFormControlErrors label="percentage">
								<AppFormControlError
									when="pattern"
									:message="$gettext('Please enter a value between 0 and 10.')"
								/>
							</AppFormControlErrors>
						</AppFormGroup>
					</fieldset>

					<fieldset>
						<legend>
							<AppTranslate>Wallet</AppTranslate>
						</legend>

						<p class="small">
							<AppTranslate>
								Your Wallet is where your earnings will be stored for you to buy
								games on Game Jolt or withdraw into your PayPal account.
							</AppTranslate>
						</p>

						<p class="small">
							<AppTranslate>
								We never take a cut of games you buy when you pay with your Wallet,
								and there are no payment processing fees. The money goes directly to
								the developer.
							</AppTranslate>
						</p>

						<AppFormGroup
							name="wallet_maximum"
							:label="$gettext(`Set an amount you would like to keep in your wallet`)"
							optional
						>
							<p class="help-block">
								<AppTranslate>
									We'll keep this amount in your Wallet when doing automatic pay
									outs. This way you always have some money to buy other games on
									the site through your Wallet.
								</AppTranslate>
								<br />
								<AppTranslate>
									To send all your money when doing automatic pay outs set this to
									$0.
								</AppTranslate>
							</p>

							<div class="input-group">
								<span class="input-group-addon">$</span>
								<AppFormControl
									type="currency"
									step="1"
									:validators="[
										validateMinValue(0),
										validateMaxValue(maxWallet / 100),
									]"
								/>
							</div>
							<AppFormControlErrors :label="$gettext('sum to keep in your wallet')" />
						</AppFormGroup>
					</fieldset>

					<fieldset>
						<legend>
							<AppTranslate>Minimum Payout</AppTranslate>
						</legend>

						<p class="small">
							<AppTranslate>
								If you'd like, you can set an amount below, and we will not make
								monthly deposits into your PayPal account until your revenue reaches
								this amount. This can help to maintain cleaner accounting on your
								end.
							</AppTranslate>
						</p>

						<AppFormGroup
							name="payout_minimum"
							:label="$gettext('Min. Payout Amount')"
							optional
						>
							<p class="help-block">
								<AppTranslate
									:translate-params="{
										max: formatCurrency(maxPayout),
									}"
								>
									The max you can set this to is %{ max } USD.
								</AppTranslate>
								<br />
								<AppTranslate>For no minimum, set this to $0.</AppTranslate>
							</p>

							<div class="input-group">
								<span class="input-group-addon">$</span>
								<AppFormControl
									type="currency"
									:validators="[
										validateMinValue(0),
										validateMaxValue(maxPayout / 100),
									]"
								/>
							</div>
							<AppFormControlErrors :label="$gettext('minimum payout')" />
						</AppFormGroup>
					</fieldset>

					<AppFormButton>
						<AppTranslate>Save</AppTranslate>
					</AppFormButton>
				</template>
			</template>
		</template>
	</AppForm>
</template>
