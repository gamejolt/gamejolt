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
import AppFinancialsManagedAccountCompanyDetails from './company-details.vue';
import AppFinancialsManagedAccountPersonTS from './person';
import AppFinancialsManagedAccountPerson from './person.vue';

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
	persons: { [id: string]: StripeData.accounts.IPerson } | null;
};

type PersonRelationship = keyof NonNullable<StripeData.accounts.IPerson['relationship']>;

// Person requirement fields start with the person id, which looks like "person_ID"
const PERSON_REQUIREMENT_FIELD = new RegExp(`^(person_.*?)\\.`);

@Component({
	components: {
		AppLoading,
		AppExpand,
		AppFinancialsManagedAccountPerson,
		AppFinancialsManagedAccountCompanyDetails,
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

	$refs!: {
		individual: AppFinancialsManagedAccountPersonTS;
		representative: AppFinancialsManagedAccountPersonTS;
	};

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

		// // This is hacky and kind of hard to explain.
		// // Sometimes fields need to be checked against the account resource's requirements field,
		// // and sometimes against the person's requirement field. This depends on the field name -
		// // if it starts with a stripe person id (looks like person_ID) its a person field.
		// //
		// // To differentiate between when we are referring to an account field or a person field
		// // (and also which person the field belongs to), we pass our components the "fully qualified"
		// // field name. e.g. person_ID.address.line1.
		// //
		// // The functions this.requiresField and this.getStripeField look at the field name
		// // to check against the correct resource. The issue is the way our form components
		// // work force us to work with a single formModel resource. This means we need to
		// // be able to reference both the account fields and the person fields on the same object.
		// //
		// // To do this, we set the person object on the account object keyed by the person ID,
		// // so we can reference the account field by account.address.line1,
		// // and reference the accoutn's person field by account.person_ID.address.line1.
		// if (this.stripe.persons) {
		// 	for (let personId in this.stripe.persons) {
		// 		(this.stripe.current as any)[personId] = this.stripe.persons[personId];
		// 	}
		// }

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

		// We special case id_number.
		// We need it for taxes, so we collect it even if it's just in "additional".
		const isTaxIdField = field === `individual.id_number` || field === `company.tax_id`;
		if (isTaxIdField && this.stripeMeta.additional.indexOf(field) !== -1) {
			return true;
		}

		let requirements: string[] = this.stripe.current?.requirements?.past_due!;

		// If the field is a person field, we need to look it up in the person object's
		// requirement fields instead of the account's requirement fields.
		// Note: the country spec minimum requirements do not list these directly,
		// they only specify which relationships they need the people attached to the
		// account to be satisfied, e.g. relationship.representative and relationship.owner
		const person = this.getPersonFromField(field);
		if (person) {
			// The requirements listed on the person object don't have the person id
			// as the start of the field, so we need to trim our provided field to match
			// against these. The +1 is for the dot that comes after the person id.
			// person_blah.address.line1 => address.line1
			field = field.substr(person.id.length + 1);
			requirements = person.requirements.past_due;
		}

		// A field is considered required if it, or its parent field is required. For example,
		// if verification.document is specified, it means verification.document.front is implicitly required too.
		//
		// A field may be required as part of the minimum requirements from the country specs,
		// or from the specific account or person object's requirements field.
		const fieldParts = field.split('.');
		do {
			field = fieldParts.join('.');
			if (this.stripeMeta.minimum.indexOf(field) !== -1) {
				return true;
			}

			if (requirements.indexOf(field) !== -1) {
				return true;
			}
			fieldParts.pop();
		} while (fieldParts.length);

		return false;
	}

	getStripeField(fieldPath: string) {
		if (!this.stripe.current) {
			return undefined;
		}

		let obj = this.stripe.current as any;

		// Same as this.requiresField, if the field is a person field,
		// we need to check if its set on the person object.
		const person = this.getPersonFromField(fieldPath);
		if (person) {
			fieldPath = fieldPath.substr(person.id.length + 1);
			obj = person as any;
		}

		// Gotta traverse the object chain.
		// We should return false if any of the paths don't exist.
		const pieces = fieldPath.split('.');
		const field = pieces.pop();

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

	get representative() {
		return this.getByRelationship('representative');
	}

	get owner() {
		return this.getByRelationship('owner');
	}

	getByRelationship(relationship: PersonRelationship) {
		if (!this.stripe.persons) {
			return null;
		}

		for (let personId in this.stripe.persons) {
			const person = this.stripe.persons[personId];
			if (person.relationship?.[relationship]) {
				return person;
			}
		}

		return null;
	}

	getPersonFromField(field: string) {
		if (!this.stripe.persons) {
			return null;
		}

		const match = PERSON_REQUIREMENT_FIELD.exec(field);
		if (!match) {
			return null;
		}

		return this.stripe.persons[match[1]] || null;
	}

	// This is only needed after the initial submission in some instances.
	get requiresVerificationDocument() {
		const personIds = ['individual'];
		personIds.push(...Object.keys(this.stripe.persons || {}));

		for (let personId of personIds) {
			if (
				this.requiresField(`${personId}.verification.document`) ||
				this.requiresField(`${personId}.verification.additional_document`)
			) {
				return true;
			}
		}

		return false;
	}

	get isVerificationPending() {
		// If they're in pending state and we don't require more info from them.
		if (!this.account || this.account.status !== 'pending') {
			return false;
		}

		return !this.requiresVerificationDocument;
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
		if (!this.account?.is_verified) {
			return false;
		}

		const allPersons = Object.values(this.stripe.persons || []);
		if (this.account.type === 'individual') {
			allPersons.push(this.stripe.current.individual as any);
		}

		return allPersons.find(person => person.verification.status !== 'verified') === undefined;
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
			const uploadPromises = [];
			const documentUploadElements = [this.$refs.individual, this.$refs.representative];
			for (let ref of documentUploadElements) {
				if (!ref) {
					continue;
				}

				const uploadPromise = ref
					.uploadDocuments(this.stripePublishableKey)
					.then(([idDocumentUploadId, additionalDocumentUploadId]) => {
						if (idDocumentUploadId) {
							data[
								`${ref.namePrefix}.verification.document.front`
							] = idDocumentUploadId;
						}

						if (additionalDocumentUploadId) {
							data[
								`${ref.namePrefix}.verification.additional_document.front`
							] = additionalDocumentUploadId;
						}
					});

				uploadPromises.push(uploadPromise);
			}

			if (uploadPromises.length) {
				await Promise.all(uploadPromises);
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
			data[`${this.account.type}.id_number`] = id;
		}

		const response = await Api.sendRequest('/web/dash/financials/account', data);
		if (response.success === false) {
			this.genericError = true;
		}

		return response;
	}
}
