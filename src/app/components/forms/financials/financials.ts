// import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
// import { Growls } from '../../../../../lib/gj-lib-client/components/growls/growls.service';

// FinancialsFormFactory.$inject = ['Form', 'currencyFilter'];
// export function FinancialsFormFactory(
// 	Form: any,
// 	currencyFilter: ng.IFilterCurrency
// ) {
// 	const form = new Form({
// 		template: require('./financials.html'),
// 	});

// 	form.onInit = (scope: any) => {
// 		scope.currencyFilter = currencyFilter;
// 		scope.formState.isLoaded = false;

// 		// We will set this to which agreement we should show them depending on
// 		// their account type.
// 		scope.formState.whichAgreement = null;

// 		Api.sendRequest('/web/dash/financials/save').then((payload: any) => {
// 			scope.account = payload.account;
// 			scope.user = payload.user;
// 			scope.partner = payload.partner;

// 			scope.maxWallet = payload.maxWallet;
// 			scope.maxPayout = payload.maxPayout;
// 			scope.minWithdraw = payload.minWithdraw;

// 			scope.formModel.wallet_maximum = scope.user.revenue_wallet_maximum / 100;
// 			scope.formModel.payout_minimum = scope.user.revenue_payout_minimum / 100;
// 			scope.formModel.percentage_split = 100 - scope.user.revenue_percentage;

// 			scope.formState.isLoaded = true;

// 			if (scope.account) {
// 				if (scope.account.tos_signed_developer) {
// 					scope.formState.whichAgreement = 'developer';
// 				} else if (scope.account.tos_signed_partner) {
// 					scope.formState.whichAgreement = 'partner';
// 				}
// 			}

// 			// We don't show them the partner agreement if they can't be a partner.
// 			if (!scope.partner && !scope.formState.whichAgreement) {
// 				scope.formState.whichAgreement = 'developer';
// 			}
// 		});

// 		scope.sliderOptions = {
// 			floor: 0,
// 			ceil: 100,
// 			translate: (v: number) => {
// 				return v + '%';
// 			},
// 			onEnd: () => {
// 				if (scope.formModel.percentage_split > 10) {
// 					scope.formModel.percentage_split = 10;
// 				}
// 			},
// 		};

// 		scope.hasSignedAgreement = () => {
// 			if (!scope.account) {
// 				return false;
// 			}

// 			return (
// 				scope.account.tos_signed_developer || scope.account.tos_signed_partner
// 			);
// 		};

// 		scope.acceptTerms = (type: 'developer' | 'partner') => {
// 			return Api.sendRequest('/web/dash/financials/save', { tos_type: type })
// 				.then((response: any) => {
// 					if (response.success !== false) {
// 						scope.account = response.account;
// 						scope.user = response.user;
// 					}
// 				})
// 				.catch(() => {
// 					Growls.error('Something went wrong.');
// 				});
// 		};
// 	};

// 	form.onSubmit = (scope: any) => {
// 		return Api.sendRequest('/web/dash/financials/save', scope.formModel)
// 			.then((response: any) => {
// 				if (response.success !== false) {
// 					scope.account = response.account;
// 					scope.user = response.user;
// 				}

// 				return response;
// 			})
// 			.catch(() => {
// 				Growls.error('Something went wrong.');
// 			});
// 	};

// 	return form;
// }

import { Component } from 'vue-property-decorator';
import * as View from '!view!./financials.html?style=./financials.styl';
import {
	BaseForm,
	FormOnSubmit,
} from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { UserStripeManagedAccount } from '../../../../lib/gj-lib-client/components/user/stripe-managed-account/stripe-managed-account';
import { User } from '../../../../lib/gj-lib-client/components/user/user.model';
import { ReferralEntry } from '../../../../lib/gj-lib-client/components/referral-entry/referral-entry.model';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';
import { AppFormLoader } from '../../../../lib/gj-lib-client/components/form-vue/loader/loader';
import { AppExpand } from '../../../../lib/gj-lib-client/components/expand/expand';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppTooltip } from '../../../../lib/gj-lib-client/components/tooltip/tooltip';
import { currency } from '../../../../lib/gj-lib-client/vue/filters/currency';
import { AppPartnerTerms } from './partner-terms/partner-terms';
import { AppDeveloperTerms } from './developer-terms/developer-terms';
import { FormFinancialsManagedAccount } from './managed-account/managed-account';

export interface FinancialsFormModel {
	wallet_maximum: number;
	payout_minimum: number;
	percentage_split: number;
}

@View
@Component({
	components: {
		AppFormLoader,
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
export class FormFinancials extends BaseForm<FinancialsFormModel>
	implements FormOnSubmit {
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

	sliderOptions = {
		floor: 0,
		ceil: 100,
		translate: (v: number) => {
			return v + '%';
		},
		onEnd: () => {
			if (this.formModel.percentage_split > 10) {
				this.formModel.percentage_split = 10;
			}
		},
	};

	currency = currency;

	get hasSignedAgreement() {
		if (!this.account) {
			return false;
		}

		return this.account.tos_signed_developer || this.account.tos_signed_partner;
	}

	get isVerified() {
		return this.account && this.account.is_verified;
	}

	onLoaded(payload: any) {
		console.log('Payload: ');
		console.log(payload);
		this.account = payload.account
			? new UserStripeManagedAccount(payload.account)
			: null;
		this.user = new User(payload.user);
		this.partner = payload.partner ? new ReferralEntry(payload.partner) : null;

		this.maxWallet = payload.maxWallet;
		this.maxPayout = payload.maxPayout;
		this.minWithdraw = payload.minWithdraw;

		// These user fields should be populated because the user object in this form's url payload should pull financial fields.
		this.formModel.wallet_maximum = this.user.revenue_wallet_maximum! / 100;
		this.formModel.payout_minimum = this.user.revenue_payout_minimum! / 100;
		this.formModel.percentage_split = 100 - this.user.revenue_percentage!;

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
		try {
			const response = await Api.sendRequest('/web/dash/financials/save', {
				tos_type: type,
			});
			if (response.success !== false) {
				this.refreshFields(response);
			}
		} catch (err) {
			console.error(err);
			Growls.error(this.$gettext('Something went wrong.'));
		}
	}

	async onSubmit() {
		try {
			const response = await Api.sendRequest(
				'/web/dash/financials/save',
				this.formModel
			);
			if (response.success !== false) {
				this.refreshFields(response);
			}

			return response;
		} catch (err) {
			console.error(err);
			Growls.error(this.$gettext('Something went wrong.'));
		}
	}

	async linkPayPal() {
		try {
			const response = await Api.sendRequest(
				'/web/dash/financials/get-paypal-auth',
				null,
				{
					detach: true,
				}
			);

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

	private refreshFields(response: any) {
		this.account = new UserStripeManagedAccount(response.account);
		this.user = new User(response.user);

		// TODO: need to update fields in the form model that were based off of the account/user fields?
	}
}
