import * as StripeData from 'stripe';
import { Component } from 'vue-property-decorator';
import { loadScript } from '../../../../../utils/utils';
import { Api } from '../../../../../_common/api/api.service';
import AppExpand from '../../../../../_common/expand/expand.vue';
import { currency } from '../../../../../_common/filters/currency';
import { BaseForm, FormOnInit, FormOnSubmit } from '../../../../../_common/form-vue/form.service';
import { Geo } from '../../../../../_common/geo/geo.service';
import AppLoading from '../../../../../_common/loading/loading.vue';
import { UserStripeManagedAccount } from '../../../../../_common/user/stripe-managed-account/stripe-managed-account';
import { User } from '../../../../../_common/user/user.model';
import AppFinancialsManagedAccountAddress from './address.vue';
import AppFinancialsManagedAccountBusiness from './business.vue';
import AppFinancialsManagedAccountContact from './contact.vue';
import AppFinancialsManagedAccountDob from './dob.vue';
import AppFinancialsManagedAccountDocumentTS from './document';
import AppFinancialsManagedAccountDocument from './document.vue';
import AppFinancialsManagedAccountName from './name.vue';
import AppFinancialsManagedAccountSsn from './ssn.vue';

interface FormModel {
	// Step 1 params.
	type: 'individual' | 'country';
	country_code: string;

	// Step 2 params.
	additional_owners_count: number;
	'legal_entity.verification.document': any;
	'legal_entity.verification.status': any;
	'legal_entity.additional_owners.0.verification.document': any;
	'legal_entity.additional_owners.1.verification.document': any;
	'legal_entity.additional_owners.2.verification.document': any;
	'legal_entity.additional_owners.3.verification.document': any;
	[k: string]: any;
}

type StripeMeta =
	| StripeData.countrySpecs.ICountrySpec['verification_fields']['individual']
	| StripeData.countrySpecs.ICountrySpec['verification_fields']['company'];

type PayloadStripeData = {
	publishableKey: string;
	countries: { [code: string]: string };
	currencies: { [code: string]: string[] };

	required: StripeMeta;
	current: StripeData.accounts.IAccount;
};

@Component({
	components: {
		AppLoading,
		AppExpand,
		AppFinancialsManagedAccountName,
		AppFinancialsManagedAccountDob,
		AppFinancialsManagedAccountAddress,
		AppFinancialsManagedAccountContact,
		AppFinancialsManagedAccountSsn,
		AppFinancialsManagedAccountDocument,
		AppFinancialsManagedAccountBusiness,
	},
})
export default class FormFinancialsManagedAccount extends BaseForm<FormModel>
	implements FormOnInit, FormOnSubmit {
	resetOnSubmit = true;
	scriptLoaded = false;
	isLoaded = false;

	stripePublishableKey = '';
	stripeMeta: StripeMeta = null as any;
	additionalOwnerIndex = 0;
	genericError = false;
	currencies: any[] = [];

	user: User = null as any;
	account: UserStripeManagedAccount = null as any;
	stripe: PayloadStripeData = null as any;
	stripeInst: stripe.Stripe = null as any;

	readonly StripeFileUploadUrl = 'https://uploads.stripe.com/v1/files';
	readonly Geo = Geo;
	readonly currency = currency;

	async onInit() {
		if (!this.scriptLoaded) {
			await loadScript('https://js.stripe.com/v3/');
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

		const stripePayload = payload.stripe as PayloadStripeData;
		this.stripePublishableKey = stripePayload.publishableKey;
		this.stripeInst = Stripe(stripePayload.publishableKey);

		this.user = new User(payload.user);
		this.account = new UserStripeManagedAccount(payload.account);
		this.stripe = stripePayload;
		this.stripeMeta = stripePayload.required;

		console.log(this.stripe);

		// TODO(Persons API)
		// this.setField('additional_owners_count', 0);
		// if (
		// 	payload.stripe &&
		// 	payload.stripe.current &&
		// 	payload.stripe.current.legal_entity.additional_owners
		// ) {
		// 	this.setField(
		// 		'additional_owners_count',
		// 		payload.stripe.current.legal_entity.additional_owners.length
		// 	);
		// }

		this.isLoaded = true;

		// scope.updateCurrencies = function( )
		// {
		// 	scope.formState.currencies = scope.stripe.currencies[ scope.formModel.bankAccount_country ];
		// }
	}

	requiresField(field: string) {
		if (!this.stripeMeta) {
			return false;
		}

		return (
			this.stripeMeta.minimum.indexOf(field) !== -1 ||
			// We special case id_number.
			// We need it for taxes, so we collect it if it's just in "additional".
			(field === `${this.account.type}.id_number` &&
				this.stripeMeta.additional.indexOf(field) !== -1) ||
			(this.stripe.current &&
				this.stripe.current.requirements &&
				this.stripe.current.requirements.past_due &&
				this.stripe.current.requirements.past_due.indexOf(field) !== -1)
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
		let obj = this.stripe.current as any;

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
		return this.requiresField(`${this.account.type}.verification.document`);
		// this.requiresField('legal_entity.additional_owners.0.verification.document') ||
		// this.requiresField('legal_entity.additional_owners.1.verification.document') ||
		// this.requiresField('legal_entity.additional_owners.2.verification.document') ||
		// this.requiresField('legal_entity.additional_owners.3.verification.document')
	}

	get requiresAdditionalVerificationDocument() {
		return this.requiresField(`${this.account.type}.verification.additional_document`);
		// this.requiresField('legal_entity.additional_owners.0.verification.additional_document') ||
		// this.requiresField('legal_entity.additional_owners.1.verification.additional_document') ||
		// this.requiresField('legal_entity.additional_owners.2.verification.additional_document') ||
		// this.requiresField('legal_entity.additional_owners.3.verification.additional_document')
	}

	get isVerificationPending() {
		// If they're in pending state and we don't require more info from them.
		if (
			this.account &&
			this.account.status === 'pending' &&
			!this.requiresVerificationDocument &&
			!this.requiresAdditionalVerificationDocument
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

		// Current deadline will be set if this account is required to fill in more by a specific date.
		// This is for additional collection of fields beyond what we want initially.
		return this.account.is_verified && !this.stripe.current.requirements!.current_deadline;
	}

	async createPiiToken(data: any) {
		if (!data[`${this.account.type}.id_number`]) {
			return null;
		}

		const response = await this.stripeInst.createToken('pii', {
			personal_id_number: data[`${this.account.type}.id_number`],
		});

		if (response.error) {
			throw response.error;
		}

		return response.token?.id;
	}

	async onSubmit() {
		// We don't want to send the sensitive data to GJ.
		const data = JSON.parse(JSON.stringify(this.formModel));

		let id;
		try {
			const documentUploadRequests = [];

			if (this.formModel[`${this.account.type}.verification.status`] !== 'verified') {
				if (this.formModel[`${this.account.type}.verification.document.front`]) {
					const idDocument: AppFinancialsManagedAccountDocumentTS = this.$refs[
						'id-document'
					] as any;

					documentUploadRequests.push(
						idDocument.uploadDocument(this.stripePublishableKey).then(_response => {
							data[`${this.account.type}.verification.document.front`] = _response.id;
						})
					);
				}

				if (this.formModel[`${this.account.type}.verification.additional_document.front`]) {
					const additionalDocument: AppFinancialsManagedAccountDocumentTS = this.$refs[
						'additional-document'
					] as any;

					documentUploadRequests.push(
						additionalDocument
							.uploadDocument(this.stripePublishableKey)
							.then(_response => {
								data[
									`${this.account.type}.verification.additional_document.front`
								] = _response.id;
							})
					);
				}
			}

			if (documentUploadRequests.length > 0) {
				await Promise.all(documentUploadRequests);
			}

			console.log(data);

			// // Additional files
			// for (let i = 0; i < 4; i++) {
			// 	if (this.formModel[`legal_entity.additional_owners.${i}.verification.document`]) {
			// 		const curIndex = i;
			// 		const idDocument: AppFinancialsManagedAccountIdDocumentTS = this.$refs[
			// 			`additional-id-document-${i}`
			// 		] as any;
			// 		const _response = await idDocument.uploadIdDocument(this.stripePublishableKey);
			// 		data[`legal_entity.additional_owners.${curIndex}.verification.document`] =
			// 			_response.id;
			// 	}
			// }

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
			data[`${this.account.type}.id_number`] = id;
		}

		const response = await Api.sendRequest('/web/dash/financials/account', data);
		if (response.success === false) {
			this.genericError = true;
		}

		return response;
	}
}
