import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import AppExpand from 'game-jolt-frontend-lib/components/expand/expand.vue';
import {
	BaseForm,
	FormOnInit,
	FormOnSubmit,
} from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { Geo } from 'game-jolt-frontend-lib/components/geo/geo.service';
import { UserStripeManagedAccount } from 'game-jolt-frontend-lib/components/user/stripe-managed-account/stripe-managed-account';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { loadScript } from 'game-jolt-frontend-lib/utils/utils';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import AppLoading from 'game-jolt-frontend-lib/vue/components/loading/loading.vue';
import { currency } from 'game-jolt-frontend-lib/vue/filters/currency';
import { Component } from 'vue-property-decorator';
import AppFinancialsManagedAccountAddress from './address.vue';
import AppFinancialsManagedAccountBusiness from './business.vue';
import AppFinancialsManagedAccountDob from './dob.vue';
import AppFinancialsManagedAccountIdDocumentTS from './id-document';
import AppFinancialsManagedAccountIdDocument from './id-document.vue';
import AppFinancialsManagedAccountName from './name.vue';
import AppFinancialsManagedAccountSsn from './ssn.vue';

interface FormModel {
	additional_owners_count: number;
	'legal_entity.verification.document': any;
	'legal_entity.verification.status': any;
	'legal_entity.additional_owners.0.verification.document': any;
	'legal_entity.additional_owners.1.verification.document': any;
	'legal_entity.additional_owners.2.verification.document': any;
	'legal_entity.additional_owners.3.verification.document': any;
	[k: string]: any;
}

@Component({
	components: {
		AppLoading,
		AppExpand,
		AppJolticon,
		AppFinancialsManagedAccountName,
		AppFinancialsManagedAccountDob,
		AppFinancialsManagedAccountAddress,
		AppFinancialsManagedAccountSsn,
		AppFinancialsManagedAccountIdDocument,
		AppFinancialsManagedAccountBusiness,
	},
})
export default class FormFinancialsManagedAccount extends BaseForm<FormModel>
	implements FormOnInit, FormOnSubmit {
	resetOnSubmit = true;
	scriptLoaded = false;
	isLoaded = false;

	stripePublishableKey = '';
	stripeMeta: any = null;
	additionalOwnerIndex = 0;
	genericError = false;
	currencies: any[] = [];

	user?: User = null as any;
	account?: UserStripeManagedAccount = null as any;
	stripe?: any = null;

	readonly StripeFileUploadUrl = 'https://uploads.stripe.com/v1/files';
	readonly Geo = Geo;
	readonly currency = currency;

	async onInit() {
		if (!this.scriptLoaded) {
			await loadScript('https://js.stripe.com/v2/');
			this.scriptLoaded = true;
		}

		// if ( Environment.env === 'development' ) {
		// 	scope.formModel.bankAccount_country = 'GB';
		// 	scope.formModel.bankAccount_currency = 'GBP',
		// 	scope.formModel.bankAccount_accountNumber = '00012345';
		// 	scope.formModel.bankAccount_routingNumber = '108800';
		// 	scope.formModel.bankAccount_accountHolderName = 'MR I C ROFLCOPTER';
		// 	scope.formModel.bankAccount_accountHolderType = 'individual';
		// }

		this.isLoaded = false;
		const payload = await Api.sendRequest('/web/dash/financials/account');

		this.stripePublishableKey = payload.stripe.publishableKey;
		Stripe.setPublishableKey(payload.stripe.publishableKey);

		this.user = new User(payload.user);
		this.account = new UserStripeManagedAccount(payload.account);
		this.stripe = payload.stripe;
		this.stripeMeta = payload.stripe.required;

		this.setField('additional_owners_count', 0);
		if (
			payload.stripe &&
			payload.stripe.current &&
			payload.stripe.current.legal_entity.additional_owners
		) {
			this.setField(
				'additional_owners_count',
				payload.stripe.current.legal_entity.additional_owners.length
			);
		}

		this.isLoaded = true;

		// scope.updateCurrencies = function( )
		// {
		// 	scope.formState.currencies = scope.stripe.currencies[ scope.formModel.bankAccount_country ];
		// }
	}

	requiresField(field: string) {
		if (!this.stripeMeta) {
			return undefined;
		}

		return (
			this.stripeMeta.minimum.indexOf(field) !== -1 ||
			// We special case personal_id_number.
			// We need it for taxes, so we collect it if it's just in "additional".
			(field === 'legal_entity.personal_id_number' &&
				this.stripeMeta.additional.indexOf(field) !== -1) ||
			(this.stripe.current &&
				this.stripe.current.verification &&
				this.stripe.current.verification.fields_needed &&
				this.stripe.current.verification.fields_needed.indexOf(field) !== -1)
		);
	}

	getStripeField(fieldPath: string) {
		if (!this.stripe.current) {
			return undefined;
		}

		// Gotta traverse the object chain.
		// We should return false if any of the paths don't exist.
		const pieces = fieldPath.split('.');
		const field = pieces.pop();
		let obj = this.stripe.current;

		for (let piece of pieces) {
			if (!obj[piece]) {
				return undefined;
			}
			obj = obj[piece];
		}

		if (!field || !obj[field]) {
			return undefined;
		}

		return obj[field];
	}

	// This is only needed after the initial submission in some instances.
	get requiresVerificationDocument() {
		return (
			this.requiresField('legal_entity.verification.document') ||
			this.requiresField('legal_entity.additional_owners.0.verification.document') ||
			this.requiresField('legal_entity.additional_owners.1.verification.document') ||
			this.requiresField('legal_entity.additional_owners.2.verification.document') ||
			this.requiresField('legal_entity.additional_owners.3.verification.document')
		);
	}

	get isVerificationPending() {
		// If they're in pending state and we don't require more info from them.
		if (
			this.account &&
			this.account.status === 'pending' &&
			!this.requiresVerificationDocument
		) {
			return true;
		}

		return false;
	}

	addAdditionalOwner() {
		this.setField('additional_owners_count', this.formModel.additional_owners_count + 1);
	}

	private removeOwnerData(idx: number) {
		const regex = new RegExp('legal_entity\\.additional_owners\\.' + idx + '\\.');
		for (let field in this.formModel) {
			if (regex.test(field)) {
				this.$delete(this.formModel, field);
			}
		}
	}

	private copyOwnerData(oldIndex: number, newIndex: number) {
		const regex = new RegExp('legal_entity\\.additional_owners\\.' + oldIndex + '\\.');
		for (let field in this.formModel) {
			if (regex.test(field)) {
				const newField = field.replace('.' + oldIndex + '.', '.' + newIndex + '.');
				this.setField(newField, this.formModel[newField]);
			}
		}
	}

	removeAdditionalOwner(index: number) {
		// Reindex all the owners after the one that was removed to be shifted over once.
		for (let i = index + 1; i < this.formModel.additional_owners_count; ++i) {
			// We have to remove the owner data from the index before.
			// If the current owner doesn't have all fields filled, it won't overwrite completely.
			// It needs a "pristine" state to copy into.
			this.removeOwnerData(i - 1);
			this.copyOwnerData(i, i - 1);
		}

		// Clear out all the fields for the last one as well since it's now shifted.
		this.removeOwnerData(this.formModel.additional_owners_count - 1);
		this.setField('additional_owners_count', this.formModel.additional_owners_count - 1);
	}

	get isComplete() {
		if (!this.account) {
			return false;
		}

		// Due by will be set if this account is required to fill in more by a specific date.
		// This is for additional collection of fields beyond what we want initially.
		return this.account.is_verified && !this.stripe.current.verification.due_by;
	}

	createPiiToken(data: any) {
		return new Promise<any>((resolve, reject) => {
			if (!data['legal_entity.personal_id_number']) {
				resolve(null);
				return;
			}

			(Stripe as any).piiData.createToken(
				{
					personal_id_number: data['legal_entity.personal_id_number'],
				},
				(_: any, response: any) => {
					if (response.error) {
						reject(response.error);
					} else {
						resolve(response.id);
					}
				}
			);
		});
	}

	async onSubmit() {
		// We don't want to send the sensitive data to GJ.
		const data = JSON.parse(JSON.stringify(this.formModel));

		let id;
		try {
			if (
				this.formModel['legal_entity.verification.document'] &&
				this.formModel['legal_entity.verification.status'] !== 'verified'
			) {
				const idDocument: AppFinancialsManagedAccountIdDocumentTS = this.$refs[
					'id-document'
				] as any;
				const _response = await idDocument.uploadIdDocument(this.stripePublishableKey);
				data['legal_entity.verification.document'] = _response.id;
			}

			// Additional files
			for (let i = 0; i < 4; i++) {
				if (this.formModel[`legal_entity.additional_owners.${i}.verification.document`]) {
					const curIndex = i;
					const idDocument: AppFinancialsManagedAccountIdDocumentTS = this.$refs[
						`additional-id-document-${i}`
					] as any;
					const _response = await idDocument.uploadIdDocument(this.stripePublishableKey);
					data[`legal_entity.additional_owners.${curIndex}.verification.document`] =
						_response.id;
				}
			}

			this.genericError = false;

			id = await this.createPiiToken(data);
		} catch (err) {
			// Error from Stripe.
			console.error(err);
			this.genericError = err.message;

			// Rethrow to make sure that no "then" blocks below go through.
			throw err;
		}

		// Override the SSN with the token.
		// This way the raw SSN never hits our server. Only the token.
		if (id) {
			data['legal_entity.personal_id_number'] = id;
		}

		// This signals the backend that the field names we're expecting to work with are dotted and not hyphenated.
		// This is for backwards compatibility support with angular which used hyphenated fields.
		data['dotted'] = true;

		const response = await Api.sendRequest('/web/dash/financials/account', data);
		if (response.success === false) {
			this.genericError = true;
		}

		return response;
	}
}
