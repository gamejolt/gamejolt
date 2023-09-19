<script lang="ts">
import * as StripeData from 'stripe';
import { inject, InjectionKey, provide, Ref, ref } from 'vue';
import { mixins, Options } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import AppExpand from '../../../../../_common/expand/AppExpand.vue';
import { formatCurrency } from '../../../../../_common/filters/currency';
import { BaseForm, FormOnSubmit } from '../../../../../_common/form-vue/form.service';
import { Geo } from '../../../../../_common/geo/geo.service';
import AppLoading from '../../../../../_common/loading/AppLoading.vue';
import {
	UserStripeManagedAccountModel,
	UserStripeManagedAccountStatus,
	UserStripeManagedAccountType,
} from '../../../../../_common/user/stripe-managed-account/stripe-managed-account';
import { UserModel } from '../../../../../_common/user/user.model';
import { loadScript } from '../../../../../utils/utils';
import { shallowSetup } from '../../../../../utils/vue';
import AppFinancialsManagedAccountCompanyDetails from './AppFinancialsManagedAccountCompanyDetails.vue';
import AppFinancialsManagedAccountPerson, {
	AppFinancialsManagedAccountPersonInterface,
} from './AppFinancialsManagedAccountPerson.vue';

export const StripeFileUploadUrl = 'https://uploads.stripe.com/v1/files';

export interface ManagedAccountFormModel {
	// Step 1 params.
	type: 'individual' | 'country';
	country_code: string;

	// Step 2 params.
	[k: string]: any;
}

type StripeMeta =
	| StripeData.countrySpecs.ICountrySpec['verification_fields']['individual']
	| StripeData.countrySpecs.ICountrySpec['verification_fields']['company'];

type PayloadStripeData = {
	publishableKey: string;
	countries: Record<string, string>;
	currencies: Record<string, string>;

	required: StripeMeta;
	current: StripeData.accounts.IAccount;
	persons: { [id: string]: StripeData.accounts.IPerson } | null;
};

type PersonRelationship = keyof NonNullable<StripeData.accounts.IPerson['relationship']>;

// Person requirement fields start with the person id, which looks like "person_ID"
const PERSON_REQUIREMENT_FIELD = new RegExp(`^(person_.*?)\\.`);

type Controller = ReturnType<typeof createFormManagedAccount>;
const Key: InjectionKey<Controller> = Symbol('form-game-release');

export function useFormManagedAccount() {
	return inject(Key, null);
}

function createFormManagedAccount() {
	const user = ref() as Ref<UserModel>;
	const account = ref() as Ref<UserStripeManagedAccountModel>;
	const stripeMeta = ref() as Ref<StripeMeta>;
	const stripe = ref() as Ref<PayloadStripeData>;

	function requiresField(field: string) {
		if (!stripeMeta.value) {
			return false;
		}

		// We special case id_number.
		// We need it for taxes, so we collect it even if it's just in "additional".
		const isTaxIdField = field === `individual.id_number` || field === `company.tax_id`;
		if (isTaxIdField && stripeMeta.value.additional.indexOf(field) !== -1) {
			return true;
		}

		let fieldRootObj: StripeData.accounts.IAccount | StripeData.accounts.IPerson =
			stripe.value.current;
		let requirements = stripe.value.current.requirements!.past_due!;

		// If the field is a person field, we need to look it up in the person object's
		// requirement fields instead of the account's requirement fields.
		// Note: the country spec minimum requirements do not list these directly,
		// they only specify which relationships they need the people attached to the
		// account to be satisfied, e.g. relationship.representative and relationship.owner
		const person = _getPersonFromField(field);
		if (person) {
			fieldRootObj = person;
			requirements = person.requirements.past_due;

			// The requirements listed on the person object don't have the person id
			// as the start of the field, so we need to trim our provided field to match
			// against these. The +1 is for the dot that comes after the person id.
			// person_blah.address.line1 => address.line1
			field = field.substr(person.id.length + 1);
		}

		// A field is considered required if it, or its parent field is required. For example,
		// if verification.document is specified, it means verification.document.front is implicitly required too.
		//
		// A field may be required as part of the minimum requirements from the country specs,
		// or from the specific account or person object's requirements field.
		const fieldParts = field.split('.');
		do {
			field = fieldParts.join('.');

			// I don't remember why we check it like this but it seems wrong. if
			// a field doens't show in requirements its possible it has been
			// fulfilled but we'll never keep requesting it. we should only have
			// to collect information that appears in the root or person's
			// requirements.past_due field.
			//
			// Update: yup, this is wrong. the reason we did this is because
			// there are some fields the backend expects us to eagerly fetch
			// even if they are not marked as required by stripe at this time.
			// this is because they usually ask for this information at a later
			// date, and that would increase friction with setting up the
			// marketplace account.
			if (stripeMeta.value.minimum.indexOf(field) !== -1) {
				// Temporary workaround - check if the person / account has the field defined on them.
				// The requirements are specified as paths to properties.
				const fieldWasProvided = _getNestedField(fieldRootObj, field) !== undefined;
				if (fieldWasProvided) {
					return false;
				}

				return true;
			}

			if (requirements.indexOf(field) !== -1) {
				return true;
			}
			fieldParts.pop();
		} while (fieldParts.length);

		return false;
	}

	function getStripeField(fieldPath: string) {
		if (!stripe.value.current) {
			return undefined;
		}

		let obj = stripe.value.current as any;

		// Same as this.requiresField, if the field is a person field,
		// we need to check if its set on the person object.
		const person = _getPersonFromField(fieldPath);
		if (person) {
			fieldPath = fieldPath.substr(person.id.length + 1);
			obj = person as any;
		}

		return _getNestedField(obj, fieldPath);
	}

	function _getNestedField(obj: any, fieldPath: string) {
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

	function _getPersonFromField(field: string) {
		if (!stripe.value.persons) {
			return null;
		}

		const match = PERSON_REQUIREMENT_FIELD.exec(field);
		if (!match) {
			return null;
		}

		return stripe.value.persons[match[1]] || null;
	}

	return {
		user,
		account,
		stripe,
		stripeMeta,

		requiresField,
		getStripeField,
	};
}

class Wrapper extends BaseForm<ManagedAccountFormModel> {}

@Options({
	components: {
		AppLoading,
		AppExpand,
		AppFinancialsManagedAccountPerson,
		AppFinancialsManagedAccountCompanyDetails,
	},
})
export default class FormFinancialsManagedAccount extends mixins(Wrapper) implements FormOnSubmit {
	scriptLoaded = false;
	isDataLoaded = false;

	controller = shallowSetup(() => {
		const c = createFormManagedAccount();
		provide(Key, c);
		return c;
	});

	get account() {
		return this.controller.account.value;
	}

	get stripe() {
		return this.controller.stripe.value;
	}

	get stripeMeta() {
		return this.controller.stripeMeta.value;
	}

	stripePublishableKey = '';
	// stripeMeta: StripeMeta = null as any;
	additionalOwnerIndex = 0;
	genericError = false;
	currencies: any[] = [];

	// user: User = null as any;
	// account: UserStripeManagedAccount = null as any;
	// stripe: PayloadStripeData = null as any;
	stripeInst: stripe.Stripe = null as any;

	readonly Geo = Geo;
	readonly formatCurrency = formatCurrency;

	readonly IndividualAccountType = UserStripeManagedAccountType.Individual;
	readonly CompanyAccountType = UserStripeManagedAccountType.Company;

	readonly PendingStatus = UserStripeManagedAccountStatus.Pending;
	readonly UnverifiedStatus = UserStripeManagedAccountStatus.Unverified;

	declare $refs: {
		individual: AppFinancialsManagedAccountPersonInterface;
		representative: AppFinancialsManagedAccountPersonInterface;
	};

	created() {
		this.form.resetOnSubmit = true;
	}

	async onInit() {
		if (!this.scriptLoaded) {
			await loadScript('https://js.stripe.com/v3/');
			this.scriptLoaded = true;
		}

		const { user, account, stripe, stripeMeta } = this.controller;

		this.isDataLoaded = false;
		const payload = await Api.sendRequest('/web/dash/financials/account');

		const stripePayload = payload.stripe as PayloadStripeData;
		this.stripePublishableKey = stripePayload.publishableKey;
		this.stripeInst = Stripe(stripePayload.publishableKey);

		user.value = new UserModel(payload.user);
		account.value = new UserStripeManagedAccountModel(payload.account);
		stripe.value = stripePayload;
		stripeMeta.value = stripePayload.required;

		this.isDataLoaded = true;
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

	// This is only needed after the initial submission in some instances.
	get requiresVerificationDocument() {
		const personIds = ['individual'];
		personIds.push(...Object.keys(this.stripe.persons || {}));

		for (let personId of personIds) {
			if (
				this.controller.requiresField(`${personId}.verification.document`) ||
				this.controller.requiresField(`${personId}.verification.additional_document`)
			) {
				return true;
			}
		}

		return false;
	}

	get isVerificationPending() {
		// If they're in pending state and we don't require more info from them.
		if (!this.account || this.account.status !== this.PendingStatus) {
			return false;
		}

		return !this.requiresVerificationDocument;
	}

	get isComplete() {
		if (!this.account?.is_verified) {
			return false;
		}

		const allPersons = Object.values(this.stripe.persons || []);
		if (this.account.type === this.IndividualAccountType) {
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
			for (const ref of documentUploadElements) {
				if (!ref) {
					continue;
				}

				const { uploadDocuments, namePrefix } = ref;

				const uploadPromise = uploadDocuments(this.stripePublishableKey).then(
					([idDocumentUploadId, additionalDocumentUploadId]) => {
						if (idDocumentUploadId) {
							data[`${namePrefix}.verification.document.front`] = idDocumentUploadId;
						}

						if (additionalDocumentUploadId) {
							data[`${namePrefix}.verification.additional_document.front`] =
								additionalDocumentUploadId;
						}
					}
				);

				uploadPromises.push(uploadPromise);
			}

			if (uploadPromises.length) {
				await Promise.all(uploadPromises);
			}

			this.genericError = false;

			id = await this.createPiiToken(data);
		} catch (err: any) {
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
</script>

<template>
	<AppForm :controller="form" class="form-dashboard-managed-account">
		<AppLoading v-if="!isDataLoaded" />

		<div v-if="isDataLoaded">
			<!--
				Account initialization.
				We need this information first.
			-->
			<div v-if="!account.is_stripe_initialized">
				<AppFormGroup name="type" :label="$gettext('Account Type')">
					<div class="radio">
						<label>
							<AppFormControlRadio value="individual" />
							<AppTranslate>Individual</AppTranslate>
							<br />
							<span class="help-inline">
								<AppTranslate>
									Are you a sole proprietor, partnership or otherwise an
									individual human being?
								</AppTranslate>
							</span>
						</label>
					</div>
					<div class="radio">
						<label>
							<AppFormControlRadio value="company" />
							<AppTranslate>Company</AppTranslate>
							<br />
							<span class="help-inline">
								<AppTranslate>
									Are you a company / corporation / business / charity / trust
									fund / etc?
								</AppTranslate>
							</span>
						</label>
					</div>
					<AppFormControlErrors />
				</AppFormGroup>

				<AppFormGroup name="country_code" :label="$gettext('Country Code')">
					<p class="help-block">
						<AppTranslate>
							Select the country of your residence or the country that your business
							is legally established in. We're working hard on expanding our reach,
							and hope to get more countries supported soon.
						</AppTranslate>
					</p>

					<AppFormControlSelect>
						<option value="">
							<AppTranslate>Please select your country...</AppTranslate>
						</option>
						<option
							v-for="(_country, code) of stripe.countries"
							:key="code"
							:value="code"
						>
							{{ Geo.getCountryName(code) }}
						</option>
					</AppFormControlSelect>
					<AppFormControlErrors label="country" />

					<AppExpand :when="!formModel.country_code">
						<br />
						<div class="alert sans-margin-bottom">
							<p>
								<AppTranslate>
									If you do not see your country above, all is not lost! We can
									still manually approve your account.
								</AppTranslate>
							</p>
							<p>
								<AppLinkExternal href="https://goo.gl/forms/igg8T9dQnZLT2c1l2">
									<AppTranslate>Request manual approval here.</AppTranslate>
								</AppLinkExternal>
							</p>
						</div>
					</AppExpand>
				</AppFormGroup>
			</div>

			<div v-if="account.is_stripe_initialized">
				<div class="alert">
					<p>
						<AppTranslate>
							This information is needed for tax purposes as well as account
							verification. We use Stripe to store and verify this data.
						</AppTranslate>
						{{ ' ' }}
						<AppLinkHelp page="why-tax-forms" class="link-help">
							<AppTranslate>Learn more</AppTranslate>
						</AppLinkHelp>
					</p>
				</div>

				<div v-if="isVerificationPending" class="alert alert-notice">
					<p>
						<strong>
							<AppTranslate>
								Stripe is in the process of verifying your details.
							</AppTranslate>
						</strong>
						{{ ' ' }}
						<AppTranslate>
							This can take anywhere from a few minutes to a few days. We'll contact
							you when the verification process is complete and if Stripe requires
							additional supporting documents (such as a photo ID) in order to
							identify you. Hang tight!
						</AppTranslate>
					</p>
				</div>

				<div v-if="requiresVerificationDocument" class="alert alert-notice">
					<p>
						<strong>
							<AppTranslate>
								Stripe needs additional identification documents in order to verify
								your account.
							</AppTranslate>
						</strong>
						{{ ' ' }}
						<AppTranslate>Please enter them below.</AppTranslate>
					</p>
				</div>

				<div class="form-horizontal">
					<div class="form-group">
						<label class="control-label col-sm-4">
							<AppTranslate>Country</AppTranslate>
						</label>
						<div class="form-static col-sm-8">
							{{ Geo.getCountryName(account.country_code) }}
						</div>
					</div>

					<div class="form-group">
						<label class="control-label col-sm-4">
							<AppTranslate>Business Type</AppTranslate>
						</label>
						<div class="form-static col-sm-8">
							<template v-if="account.type === IndividualAccountType">
								<AppTranslate>Individual</AppTranslate>
							</template>
							<template v-else-if="account.type === CompanyAccountType">
								<AppTranslate>Company</AppTranslate>
							</template>
						</div>
					</div>
				</div>

				<hr />

				<!--
					Individual Account Setup
				-->
				<div v-if="account.type === IndividualAccountType">
					<h4><AppTranslate>Your Details</AppTranslate></h4>

					<div v-if="account.status === UnverifiedStatus" class="alert">
						<p>
							<AppTranslate>Please fill in your personal information.</AppTranslate>
						</p>
					</div>

					<AppFinancialsManagedAccountPerson
						ref="individual"
						name-prefix="individual"
						:country-code="account.country_code"
					/>
				</div>

				<!--
					Company Account Setup
				-->
				<div v-else-if="account.type === CompanyAccountType">
					<h4><AppTranslate>Company Details</AppTranslate></h4>

					<AppFinancialsManagedAccountCompanyDetails />

					<h4><AppTranslate>Representative Details</AppTranslate></h4>

					<div v-if="account.status === UnverifiedStatus" class="alert">
						<p>
							<AppTranslate>
								We are required to collection information for a representative of
								your company.
							</AppTranslate>
						</p>
					</div>

					<AppFinancialsManagedAccountPerson
						v-if="representative"
						ref="representative"
						:name-prefix="representative.id"
					/>
				</div>
			</div>

			<!--
				There may be a specific error message, or a generic one.
			-->
			<AppExpand :when="!!genericError">
				<div class="alert alert-notice">
					<p v-if="genericError !== true">{{ genericError }}</p>
					<p v-else-if="!account.is_stripe_initialized">
						<AppTranslate>
							Something went wrong. Please check that you've entered everything
							correctly.
						</AppTranslate>
					</p>
					<p v-else>
						<AppTranslate>
							Something went wrong. Please check that you've entered everything
							correctly. This is usually because of an invalid zip/postal code,
							invalid SSN/EIN or phone number.
						</AppTranslate>
					</p>
				</div>
			</AppExpand>

			<AppLoading v-if="form.isProcessing" :label="$gettext(`Processing...`)" />

			<AppFormButton v-if="!isComplete && !isVerificationPending">
				<AppTranslate>Save and Continue</AppTranslate>
			</AppFormButton>

			<br />
		</div>
	</AppForm>
</template>

<style lang="stylus" scoped>
.form-dashboard-managed-account
	// Less spacing.
	::v-deep(.form-horizontal)
		.form-group
			margin-bottom: 10px

		.control-label
			padding-top: 0
</style>
