import { Component } from 'vue-property-decorator';
import View from '!view!./financials.html?style=./financials.styl';
import {
	BaseForm,
	FormOnSubmit,
	FormOnLoad,
} from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { UserStripeManagedAccount } from '../../../../lib/gj-lib-client/components/user/stripe-managed-account/stripe-managed-account';
import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { ReferralEntry } from '../../../../lib/gj-lib-client/components/referral-entry/referral-entry.model';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';
import { AppExpand } from '../../../../lib/gj-lib-client/components/expand/expand';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { currency } from '../../../../lib/gj-lib-client/vue/filters/currency';
import { AppPartnerTerms } from './partner-terms/partner-terms';
import { AppDeveloperTerms } from './developer-terms/developer-terms';
import { FormFinancialsManagedAccount } from './managed-account/managed-account';
import {
	FormOnSubmitError,
	FormOnInit,
} from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { AppForm } from '../../../../lib/gj-lib-client/components/form-vue/form';

interface FormModel {
	tos_type?: 'partner' | 'developer';
	wallet_maximum: number;
	payout_minimum: number;
	percentage_split: number;
}

@View
@Component({
	components: {
		AppExpand,
		AppJolticon,
		AppPartnerTerms,
		AppDeveloperTerms,
		FormFinancialsManagedAccount,
	},
	directives: {
		AppTooltip,
	},
	filters: {
		currency,
	},
})
export class FormFinancials extends BaseForm<FormModel>
	implements FormOnInit, FormOnSubmit, FormOnLoad, FormOnSubmitError {
	resetOnSubmit = true;
	reloadOnSubmit = true;

	$refs: {
		form: AppForm;
	};

	// We will set this to which agreement we should show them depending on
	// their account type.
	whichAgreement: 'developer' | 'partner' = null as any;
	account: UserStripeManagedAccount | null = null;

	// We store the user again instead of using the one from app store because this one would have financials data in it.
	user: User = null as any;
	partner: ReferralEntry | null = null;

	maxWallet: number;
	maxPayout: number;
	minWithdraw: number;

	currency = currency;

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
		this.$refs.form.submit();
	}

	onSubmit() {
		return Api.sendRequest('/web/dash/financials/save', this.formModel);
	}

	onSubmitError() {
		Growls.error(this.$gettext('Something went wrong.'));
	}

	async linkPayPal() {
		try {
			const response = await Api.sendRequest('/web/dash/financials/get-paypal-auth', null, {
				detach: true,
			});

			if (!response || !response.authUrl) {
				throw new Error(`Response does not have an 'authUrl' field`);
			}

			if (GJ_IS_CLIENT) {
				require('nw.gui').Shell.openExternal(response.authUrl);
			} else {
				window.location.href = response.authUrl;
			}
		} catch (err) {
			console.error(err);
			Growls.error(this.$gettext('Could not get PayPal redirect URL.'));
		}
	}
}
