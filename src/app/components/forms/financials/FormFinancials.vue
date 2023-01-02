<script lang="ts" setup>
import { computed, ref } from 'vue';
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
import AppJolticon from '../../../../_common/jolticon/AppJolticon.vue';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import { Navigate } from '../../../../_common/navigate/navigate.service';
import { ReferralEntry } from '../../../../_common/referral-entry/referral-entry.model';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { $gettext } from '../../../../_common/translate/translate.service';
import { UserStripeManagedAccount } from '../../../../_common/user/stripe-managed-account/stripe-managed-account';
import {
	CreatorStatusApplied,
	CreatorStatusCreator,
	User,
} from '../../../../_common/user/user.model';
import AppCreatorTerms from './AppCreatorTerms.vue';
import AppDeveloperTerms from './AppDeveloperTerms.vue';
import AppPartnerTerms from './AppPartnerTerms.vue';
import FormFinancialsManagedAccount from './managed-account/managed-account.vue';

interface FormModel {
	tos_type?: 'partner' | 'developer' | 'creator';
	wallet_maximum: number;
	payout_minimum: number;
	percentage_split: number;
}

const account = ref<UserStripeManagedAccount>();

// We store the user again instead of using the one from app store because this
// one would have financials data in it.
const user = ref<User>(undefined as any);
const partner = ref<ReferralEntry>();

const maxWallet = ref(0);
const maxPayout = ref(0);
const minWithdraw = ref(0);

const isVerified = computed(() => account.value && account.value.is_verified);
const canBeCreator = computed(
	() =>
		user.value.creator_status === CreatorStatusApplied ||
		user.value.creator_status === CreatorStatusCreator
);
const canBePartner = computed(() => !!partner.value);

/**
 * If they have an account with TOS signed for a marketplace program. This deals
 * with real usd and is treated differently.
 */
const hasMarketplaceAccount = computed(
	() =>
		account.value &&
		(account.value.tos_signed_developer > 0 || account.value.tos_signed_partner > 0)
);

const form: FormController<FormModel> = createForm({
	reloadOnSubmit: true,
	onInit() {
		form.formModel.tos_type = undefined;
	},
	loadUrl: `/web/dash/financials/save`,
	onLoad(payload) {
		user.value = new User(payload.user);
		account.value = payload.account ? new UserStripeManagedAccount(payload.account) : undefined;
		partner.value = payload.partner ? new ReferralEntry(payload.partner) : undefined;

		maxWallet.value = payload.maxWallet;
		maxPayout.value = payload.maxPayout;
		minWithdraw.value = payload.minWithdraw;

		// These user fields should be populated because the user object in this
		// form's url payload should pull financial fields.
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

async function acceptTerms(type: 'partner' | 'developer' | 'creator') {
	form.formModel.tos_type = type;
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
		<template v-if="!form.isLoadedBootstrapped">
			<AppLoading centered />
		</template>
		<template v-else>
			<template v-if="!isVerified">
				<AppAlertBox icon="notice" color="highlight">
					<AppTranslate>
						Before you can earn money, we'll need to gather some details from you. This
						will ensure that your account is completely set up and ready to run
						smoothly.
					</AppTranslate>
				</AppAlertBox>
			</template>
			<template v-else>
				<AppAlertBox icon="check" color="highlight">
					<AppTranslate>Your account is all ready to go!</AppTranslate>
				</AppAlertBox>
			</template>
			<br />

			<!-- First step is to sign an agreement. -->
			<AppCreatorTerms
				v-if="canBeCreator"
				:account="account"
				@accepted="acceptTerms('creator')"
			/>

			<AppPartnerTerms
				v-if="canBePartner"
				:account="account"
				@accepted="acceptTerms('partner')"
			/>

			<AppDeveloperTerms :account="account" @accepted="acceptTerms('developer')" />

			<!-- PayPal is required. -->
			<fieldset v-if="account">
				<legend>
					<span
						v-if="user.paypal_id"
						v-app-tooltip="$gettext(`You have completed this section.`)"
						class="pull-right done-icon"
					>
						<AppJolticon icon="check" big />
					</span>
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
					<span
						v-if="isVerified"
						v-app-tooltip="$gettext(`You have completed this section.`)"
						class="pull-right done-icon"
					>
						<AppJolticon icon="check" big />
					</span>
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
				<template v-else-if="hasMarketplaceAccount">
					<FormFinancialsManagedAccount />
				</template>
				<template v-else>
					<div class="alert">
						<p>
							<AppTranslate>
								We will reach out to you to finish the approval process.
							</AppTranslate>
						</p>
					</div>
				</template>
			</fieldset>

			<!-- The next stuff only has to happen if they've signed up for one
			of the marketplace-type programs. -->
			<template v-if="isVerified && hasMarketplaceAccount">
				<!-- Only allow them to change percentage split if they are
				signed up as a dev. -->
				<fieldset v-if="account?.tos_signed_developer">
					<legend>
						<AppTranslate>Percentage Split</AppTranslate>
					</legend>

					<p v-translate class="small">
						You decide what percentage of your sale revenue to give to Game Jolt.
						<b>We won't let you give us more than 10%</b>
						because we'd rather have you support other developers by buying their games.
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
							Your Wallet is where your earnings will be stored for you to buy games
							on Game Jolt or withdraw into your PayPal account.
						</AppTranslate>
					</p>

					<p class="small">
						<AppTranslate>
							We never take a cut of games you buy when you pay with your Wallet, and
							there are no payment processing fees. The money goes directly to the
							developer.
						</AppTranslate>
					</p>

					<AppFormGroup
						name="wallet_maximum"
						:label="$gettext(`Set an amount you would like to keep in your wallet`)"
						optional
					>
						<p class="help-block">
							<AppTranslate>
								We'll keep this amount in your Wallet when doing automatic pay outs.
								This way you always have some money to buy other games on the site
								through your Wallet.
							</AppTranslate>
							<br />
							<AppTranslate>
								To send all your money when doing automatic pay outs set this to $0.
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
							If you'd like, you can set an amount below, and we will not make monthly
							deposits into your PayPal account until your revenue reaches this
							amount. This can help to maintain cleaner accounting on your end.
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
	</AppForm>
</template>

<style lang="stylus" scoped>
.form-dashboard-financials
	::v-deep(.done-icon)
		theme-prop('color', 'link')

	::v-deep(.tos-scroller)
		scrollable()
		theme-prop('border-color', 'bg-offset')
		padding: 10px
		max-height: 500px
		font-size: $font-size-small
		border-width: $border-width-base
		border-style: solid

		h1
		h2
		h3
		h4
		h5
		h6
		p
			&:first-child
				margin-top: 0
</style>
