import { Component } from 'vue-property-decorator';
import * as View from '!view!./managed-account.html?style=./managed-account.styl';
import { Geo } from '../../../../../lib/gj-lib-client/components/geo/geo.service';
import { currency } from '../../../../../lib/gj-lib-client/vue/filters/currency';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { UserStripeManagedAccount } from '../../../../../lib/gj-lib-client/components/user/stripe-managed-account/stripe-managed-account';
import { User } from '../../../../../lib/gj-lib-client/components/user/user.model';
import { FormOnSubmit } from '../../../../../lib/gj-lib-client/components/form-vue/form.service';
import { loadScript } from '../../../../../lib/gj-lib-client/utils/utils';
import { AppLoading } from '../../../../../lib/gj-lib-client/vue/components/loading/loading';
import { AppExpand } from '../../../../../lib/gj-lib-client/components/expand/expand';
import { AppJolticon } from '../../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { FormFinancialsManagedAccountName } from './name';
import { FormFinancialsManagedAccountDob } from './dob';
import { FormFinancialsManagedAccountAddress } from './address';
import { FormFinancialsManagedAccountSsn } from './ssn';
import { FormFinancialsManagedAccountIdDocument } from './id-document';
import { AppFormControlUpload } from '../../../../../lib/gj-lib-client/components/form-vue/control/upload/upload';
import {
	BaseForm,
	FormOnInit,
} from '../../../../../lib/gj-lib-client/components/form-vue/form.service';

export interface Helpers {
	requiresField: (field: string) => boolean | undefined;
	getStripeField: (fieldPath: string) => any;
	requiresVerificationDocument: () => boolean | undefined;
	isVerificationPending: () => boolean;
	addAdditionalOwner: () => void;
	removeAdditionalOwner: (index: number) => void;
}

@View
@Component({
	components: {
		AppLoading,
		AppExpand,
		AppJolticon,
		FormFinancialsManagedAccountName,
		FormFinancialsManagedAccountDob,
		FormFinancialsManagedAccountAddress,
		FormFinancialsManagedAccountSsn,
		FormFinancialsManagedAccountIdDocument,
	},
})
export class FormFinancialsManagedAccount extends BaseForm<any>
	implements FormOnInit, FormOnSubmit {
	resetOnSubmit = true;
	isLoaded = false;
	isComplete = false;

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

	_self = this;
	helpers: Helpers = null as any;

	mounted() {
		return loadScript('https://js.stripe.com/v2/');
	}

	async onInit() {
		// if ( Environment.env === 'development' ) {
		// 	scope.formModel.bankAccount_country = 'GB';
		// 	scope.formModel.bankAccount_currency = 'GBP',
		// 	scope.formModel.bankAccount_accountNumber = '00012345';
		// 	scope.formModel.bankAccount_routingNumber = '108800';
		// 	scope.formModel.bankAccount_accountHolderName = 'MR I C ROFLCOPTER';
		// 	scope.formModel.bankAccount_accountHolderType = 'individual';
		// }

		// TODO: change to vue uploader?
		// await Loader.load('upload');

		// Gotta load in the Stripe JS API as well.
		// await loadScript('https://js.stripe.com/v2/');

		const payload = await Api.sendRequest('/web/dash/financials/account');
		console.log(payload);

		this.stripePublishableKey = payload.stripe.publishableKey;
		Stripe.setPublishableKey(payload.stripe.publishableKey);

		// TODO add types?
		Object.assign(this, payload);

		this.stripeMeta = {};
		Object.assign(this.stripeMeta, payload.stripe.required);
		console.log(this.stripeMeta);

		this.formModel.additional_owners_count = 0;
		if (
			payload.stripe &&
			payload.stripe.current &&
			payload.stripe.current.legal_entity.additional_owners
		) {
			this.formModel.additional_owners_count =
				payload.stripe.current.legal_entity.additional_owners.length;
		}

		// Due by will be set if this account is required to fill in more by a specific date.
		// This is for additional collection of fields beyond what we want initially.
		this.isComplete =
			payload.account.is_verified &&
			!payload.stripe.current.verification.due_by;

		this.isLoaded = true;

		const _self = this;
		this.helpers = {
			requiresField: (field: string) => {
				if (!_self.stripeMeta) {
					return undefined;
				}

				return (
					_self.stripeMeta.minimum.indexOf(field) !== -1 ||
					// We special case personal_id_number.
					// We need it for taxes, so we collect it if it's just in "additional".
					(field === 'legal_entity.personal_id_number' &&
						_self.stripeMeta.additional.indexOf(field) !== -1) ||
					(_self.stripe.current &&
						_self.stripe.current.verification &&
						_self.stripe.current.verification.fields_needed &&
						_self.stripe.current.verification.fields_needed.indexOf(field) !==
							-1)
				);
			},

			getStripeField: (fieldPath: string) => {
				if (!_self.stripe.current) {
					return undefined;
				}

				// Gotta traverse the object chain.
				// We should return false if any of the paths don't exist.
				const pieces = fieldPath.split('.');
				const field = pieces.pop();
				let obj = _self.stripe.current;

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
			},

			// This is only needed after the initial submission in some instances.
			requiresVerificationDocument: () => {
				return (
					_self.helpers.requiresField('legal_entity.verification.document') ||
					_self.helpers.requiresField(
						'legal_entity.additional_owners.0.verification.document'
					) ||
					_self.helpers.requiresField(
						'legal_entity.additional_owners.1.verification.document'
					) ||
					_self.helpers.requiresField(
						'legal_entity.additional_owners.2.verification.document'
					) ||
					_self.helpers.requiresField(
						'legal_entity.additional_owners.3.verification.document'
					)
				);
			},

			isVerificationPending: () => {
				// If they're in pending state and we don't require more info from them.
				if (
					_self.account &&
					_self.account.status === 'pending' &&
					!_self.helpers.requiresVerificationDocument()
				) {
					return true;
				}

				return false;
			},

			addAdditionalOwner: () => {
				++_self.formModel.additional_owners_count;
			},

			removeAdditionalOwner: (index: number) => {
				// Helpers.
				function removeOwnerData(idx: number) {
					const regex = new RegExp(
						'legal_entity\\.additional_owners\\.' + idx + '\\.'
					);
					for (let field in _self.formModel) {
						if (regex.test(field)) {
							delete _self.formModel[field];
						}
					}
				}

				function copyOwnerData(oldIndex: number, newIndex: number) {
					const regex = new RegExp(
						'legal_entity\\.additional_owners\\.' + oldIndex + '\\.'
					);
					for (let field in _self.formModel) {
						if (regex.test(field)) {
							const newField = field.replace(
								'.' + oldIndex + '.',
								'.' + newIndex + '.'
							);
							_self.formModel[newField] = _self.formModel[field];
						}
					}
				}

				// Reindex all the owners after the one that was removed to be shifted over once.
				for (
					let i = index + 1;
					i < _self.formModel.additional_owners_count;
					++i
				) {
					// We have to remove the owner data from the index before.
					// If the current owner doesn't have all fields filled, it won't overwrite completely.
					// It needs a "pristine" state to copy into.
					removeOwnerData(i - 1);
					copyOwnerData(i, i - 1);
				}

				// Clear out all the fields for the last one as well since it's now shifted.
				removeOwnerData(_self.formModel.additional_owners_count - 1);
				--_self.formModel.additional_owners_count;
			},
		};

		// scope.updateCurrencies = function( )
		// {
		// 	scope.formState.currencies = scope.stripe.currencies[ scope.formModel.bankAccount_country ];
		// }
	}

	uploadIdDocument(refChain: string[]) {
		// TODO: this doesn't work with the new uploader
		return new Promise<any>((resolve, reject) => {
			const formData = new FormData();
			formData.append('purpose', 'identity_document');

			console.log(this.$refs);
			let uploadComponent: any = this;
			for (let refId of refChain) {
				console.log(uploadComponent.$refs);
				uploadComponent = uploadComponent.$refs[refId];
			}
			console.log(uploadComponent);
			if (!(uploadComponent instanceof AppFormControlUpload)) {
				throw new Error('Could not upload document');
			}
			formData.append('file', uploadComponent.files[0]!);

			// const fileElement = document.getElementById(inputId)!.querySelector(
			// 	`input[type='file']`
			// );
			// formData.append('file', (fileElement as any).files[0]);

			const xhr = new XMLHttpRequest();
			xhr.open('POST', this.StripeFileUploadUrl);
			xhr.setRequestHeader(
				'Authorization',
				'Bearer ' + this.stripePublishableKey
			);
			xhr.setRequestHeader('Accept', 'application/json'); // Makes sure it doesn't return as JSONP.
			xhr.send(formData);

			xhr.onreadystatechange = function() {
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						resolve(JSON.parse(xhr.responseText));
					} else {
						reject(JSON.parse(xhr.responseText).error);
					}
				}
			};
		});
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
				function(_: any, response: any) {
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
		const data: typeof FormFinancialsManagedAccount.prototype.formModel = JSON.parse(
			JSON.stringify(this.formModel)
		);

		console.log('Submitting data: ');
		console.log(data);

		let id;
		try {
			if (
				this.formModel['legal_entity.verification.document'] &&
				this.formModel['legal_entity.verification.status'] !== 'verified'
			) {
				const _response = await this.uploadIdDocument([
					'uploadId',
					'document-input',
				]);
				data['legal_entity.verification.document'] = _response.id;
			}

			// Additional files
			for (let i = 0; i < 4; i++) {
				if (
					this.formModel[
						'legal_entity.additional_owners.' + i + '.verification.document'
					]
				) {
					const curIndex = i;
					const _response = await this.uploadIdDocument([
						'legal_entity.additional_owners.' +
							curIndex +
							'.verification.document-input',
					]);
					data[
						'legal_entity.additional_owners.' +
							curIndex +
							'.verification.document'
					] =
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

		const response = await Api.sendRequest(
			'/web/dash/financials/account',
			data
		);
		if (response.success === false) {
			this.genericError = true;
		}

		return response;
	}
}
