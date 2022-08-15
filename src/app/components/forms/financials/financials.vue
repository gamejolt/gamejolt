<script lang="ts">
import { mixins, Options } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import AppExpand from '../../../../_common/expand/AppExpand.vue';
import { formatCurrency } from '../../../../_common/filters/currency';
import {
	BaseForm,
	FormOnLoad,
	FormOnSubmit,
	FormOnSubmitError,
} from '../../../../_common/form-vue/form.service';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import { Navigate } from '../../../../_common/navigate/navigate.service';
import { ReferralEntry } from '../../../../_common/referral-entry/referral-entry.model';
import { vAppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { UserStripeManagedAccount } from '../../../../_common/user/stripe-managed-account/stripe-managed-account';
import { User } from '../../../../_common/user/user.model';
import AppDeveloperTerms from './developer-terms/developer-terms.vue';
import FormFinancialsManagedAccount from './managed-account/managed-account.vue';
import AppPartnerTerms from './partner-terms/partner-terms.vue';

interface FormModel {
	tos_type?: 'partner' | 'developer';
	wallet_maximum: number;
	payout_minimum: number;
	percentage_split: number;
}

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppExpand,
		AppPartnerTerms,
		AppDeveloperTerms,
		FormFinancialsManagedAccount,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class FormFinancials
	extends mixins(Wrapper)
	implements FormOnSubmit, FormOnLoad, FormOnSubmitError
{
	// We will set this to which agreement we should show them depending on
	// their account type.
	whichAgreement: 'developer' | 'partner' = null as any;
	account: UserStripeManagedAccount | null = null;

	// We store the user again instead of using the one from app store because this one would have financials data in it.
	user: User = null as any;
	partner: ReferralEntry | null = null;

	maxWallet = 0;
	maxPayout = 0;
	minWithdraw = 0;

	readonly formatCurrency = formatCurrency;

	get loadUrl() {
		return `/web/dash/financials/save`;
	}

	get hasSignedAgreement() {
		if (!this.account) {
			return false;
		}

		return this.account.tos_signed_developer || this.account.tos_signed_partner;
	}

	get isVerified() {
		return this.account && this.account.is_verified;
	}

	created() {
		this.form.reloadOnSubmit = true;
	}

	onInit() {
		this.setField('tos_type', undefined);
	}

	onLoad(payload: any) {
		this.user = new User(payload.user);
		this.account = payload.account ? new UserStripeManagedAccount(payload.account) : null;
		this.partner = payload.partner ? new ReferralEntry(payload.partner) : null;

		this.maxWallet = payload.maxWallet;
		this.maxPayout = payload.maxPayout;
		this.minWithdraw = payload.minWithdraw;

		// These user fields should be populated because the user object in this form's url payload should pull financial fields.
		this.setField('wallet_maximum', this.user.revenue_wallet_maximum! / 100);
		this.setField('payout_minimum', this.user.revenue_payout_minimum! / 100);
		this.setField('percentage_split', 100 - this.user.revenue_percentage!);

		if (this.account) {
			if (this.account.tos_signed_developer) {
				this.whichAgreement = 'developer';
			} else if (this.account.tos_signed_partner) {
				this.whichAgreement = 'partner';
			}
		}

		// We don't show them the partner agreement if they can't be a partner.
		if (!this.partner && !this.whichAgreement) {
			this.whichAgreement = 'developer';
		}
	}

	async acceptTerms(type: 'partner' | 'developer') {
		this.setField('tos_type', type);
		this.form.submit();
	}

	onSubmit() {
		return Api.sendRequest('/web/dash/financials/save', this.formModel);
	}

	onSubmitError() {
		showErrorGrowl(this.$gettext('Something went wrong.'));
	}

	async linkPayPal() {
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
			showErrorGrowl(this.$gettext('Could not get PayPal redirect URL.'));
		}
	}
}
</script>

<template>
	<AppForm :controller="form" class="form-dashboard-financials">
		<template v-if="!isVerified">
			<div class="alert">
				<AppTranslate>
					Before you can use the Marketplace, we'll need to gather some details from you.
					This will ensure that your account is completely set up and ready to run
					smoothly on the Game Jolt Marketplace.
				</AppTranslate>
			</div>

			<!-- If they haven't accepted any terms yet. -->
			<fieldset v-if="!hasSignedAgreement && partner">
				<legend>
					<AppTranslate
						>To start, which type of account would you like to set up?</AppTranslate
					>
				</legend>

				<div class="row">
					<div class="col-xs-6">
						<AppButton
							block
							:solid="whichAgreement === 'developer'"
							@click="whichAgreement = 'developer'"
						>
							<AppTranslate>I'm a game developer</AppTranslate>
						</AppButton>
					</div>
					<div class="col-xs-6">
						<AppButton
							block
							:solid="whichAgreement === 'partner'"
							@click="whichAgreement = 'partner'"
						>
							<AppTranslate>I'm a partner</AppTranslate>
						</AppButton>
					</div>
				</div>
			</fieldset>
		</template>

		<div v-if="isVerified" class="alert">
			<AppJolticon icon="check" />
			<AppTranslate>
				Your account is ready for the Game Jolt Marketplace! You can set additional options
				below.
			</AppTranslate>
		</div>
		<br />

		<!-- First step is to sign an agreement. -->
		<AppExpand :when="!!whichAgreement || hasSignedAgreement">
			<AppDeveloperTerms
				v-if="whichAgreement === 'developer' || hasSignedAgreement"
				:account="account"
				@accepted="acceptTerms('developer')"
			/>

			<AppPartnerTerms
				v-if="partner && (whichAgreement === 'partner' || hasSignedAgreement)"
				:account="account"
				@accepted="acceptTerms('partner')"
			/>
		</AppExpand>

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
				<p class="small">
					<AppTranslate>
						We currently use PayPal for automatic monthly deposits. You will also be
						able to withdraw your revenue at any time through this linked account.
					</AppTranslate>
				</p>

				<div v-if="user.paypal_id">
					<label class="control-label">
						<AppTranslate>Current PayPal Account</AppTranslate>
					</label>
					<div class="form-static">{{ user.paypal_email_address }}</div>
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
				<AppTranslate>Marketplace Account</AppTranslate>
			</legend>

			<FormFinancialsManagedAccount v-if="!account.skip_stripe" />

			<div v-if="account.skip_stripe" class="alert">
				<p>
					<AppTranslate>You've been manually approved for the Marketplace.</AppTranslate>
				</p>
			</div>
		</fieldset>

		<!-- Only allow them to change percentage split if they are signed up as a dev. -->
		<fieldset v-if="isVerified && account.tos_signed_developer">
			<legend><AppTranslate>Percentage Split</AppTranslate></legend>

			<p v-translate class="small">
				You decide what percentage of your sale revenue to give to Game Jolt.
				<b>We won't let you give us more than 10%</b>
				because we'd rather have you support other developers by buying their games.
			</p>

			<AppFormGroup name="percentage_split" :hide-label="true">
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
				<AppFormControlErrors
					label="percentage"
					when="pattern"
					:message="$gettext('Please enter a value between 0 and 10.')"
				/>
			</AppFormGroup>
		</fieldset>

		<fieldset v-if="isVerified">
			<legend><AppTranslate>Wallet</AppTranslate></legend>

			<p class="small">
				<AppTranslate>
					Your Wallet is where your earnings will be stored for you to buy games on Game
					Jolt or withdraw into your PayPal account.
				</AppTranslate>
			</p>

			<p class="small">
				<AppTranslate>
					We never take a cut of games you buy when you pay with your Wallet, and there
					are no payment processing fees. The money goes directly to the developer.
				</AppTranslate>
			</p>

			<AppFormGroup
				name="wallet_maximum"
				:label="$gettext(`Set an amount you would like to keep in your wallet`)"
			>
				<p class="help-block">
					<AppTranslate>
						We'll keep this amount in your Wallet when doing automatic pay outs. This
						way you always have some money to buy other games on the site through your
						Wallet.
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
						:validators="[validateMinValue(0), validateMaxValue(maxWallet / 100)]"
					/>
				</div>
				<AppFormControlErrors :label="$gettext('sum to keep in your wallet')" />
			</AppFormGroup>
		</fieldset>

		<fieldset v-if="isVerified">
			<legend><AppTranslate>Minimum Payout</AppTranslate></legend>

			<p class="small">
				<AppTranslate>
					If you'd like, you can set an amount below, and we will not make monthly
					deposits into your PayPal account until your revenue reaches this amount. This
					can help to maintain cleaner accounting on your end.
				</AppTranslate>
			</p>

			<AppFormGroup name="payout_minimum" :label="$gettext('Min. Payout Amount')">
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
						:validators="[validateMinValue(0), validateMaxValue(maxPayout / 100)]"
					/>
				</div>
				<AppFormControlErrors :label="$gettext('minimum payout')" />
			</AppFormGroup>
		</fieldset>

		<AppFormButton v-if="isVerified">
			<AppTranslate>Save</AppTranslate>
		</AppFormButton>
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
