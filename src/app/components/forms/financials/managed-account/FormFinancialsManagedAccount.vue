<script lang="ts">
import * as StripeData from 'stripe';
import { computed, inject, InjectionKey, provide, Ref, ref, useTemplateRef } from 'vue';

import AppFinancialsManagedAccountCompanyDetails from '~app/components/forms/financials/managed-account/AppFinancialsManagedAccountCompanyDetails.vue';
import AppFinancialsManagedAccountPerson from '~app/components/forms/financials/managed-account/AppFinancialsManagedAccountPerson.vue';
import { Api } from '~common/api/api.service';
import AppExpand from '~common/expand/AppExpand.vue';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import AppFormControlRadio from '~common/form-vue/controls/AppFormControlRadio.vue';
import AppFormControlSelect from '~common/form-vue/controls/AppFormControlSelect.vue';
import { Geo } from '~common/geo/geo.service';
import AppLinkExternal from '~common/link/AppLinkExternal.vue';
import AppLinkHelp from '~common/link/AppLinkHelp.vue';
import AppLoading from '~common/loading/AppLoading.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { UserStripeManagedAccountModel } from '~common/user/stripe-managed-account/stripe-managed-account';
import {
	UserStripeManagedAccountTypeCompany,
	UserStripeManagedAccountTypeIndividual,
} from '~common/user/stripe-managed-account/stripe-managed-account';
import {
	UserStripeManagedAccountStatusPending,
	UserStripeManagedAccountStatusUnverified,
} from '~common/user/stripe-managed-account/stripe-managed-account';
import { UserModel } from '~common/user/user.model';
import { loadScript } from '~utils/utils';

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

export function createFormManagedAccount() {
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
</script>

<script lang="ts" setup>
let scriptLoaded = false;
const isDataLoaded = ref(false);

const controller = createFormManagedAccount();
provide(Key, controller);

const account = computed(() => controller.account.value);
const stripe = computed(() => controller.stripe.value);
let stripePublishableKey = '';
let genericError = ref<boolean | string>(false);

let stripeInst: stripe.Stripe = null as any;

const individualRef = useTemplateRef('individual');
const representativeRef = useTemplateRef('representative');

const IndividualAccountType = UserStripeManagedAccountTypeIndividual;
const CompanyAccountType = UserStripeManagedAccountTypeCompany;
const UnverifiedStatus = UserStripeManagedAccountStatusUnverified;

const form: FormController<ManagedAccountFormModel> = createForm<ManagedAccountFormModel>({
	resetOnSubmit: true,
	async onInit() {
		if (!scriptLoaded) {
			await loadScript('https://js.stripe.com/v3/');
			scriptLoaded = true;
		}

		const { user, account, stripe, stripeMeta } = controller;

		isDataLoaded.value = false;
		const payload = await Api.sendRequest('/web/dash/financials/account');

		const stripePayload = payload.stripe as PayloadStripeData;
		stripePublishableKey = stripePayload.publishableKey;
		stripeInst = Stripe(stripePayload.publishableKey);

		user.value = new UserModel(payload.user);
		account.value = new UserStripeManagedAccountModel(payload.account);
		stripe.value = stripePayload;
		stripeMeta.value = stripePayload.required;

		isDataLoaded.value = true;
	},
	async onSubmit() {
		// We don't want to send the sensitive data to GJ.
		const data = JSON.parse(JSON.stringify(form.formModel));

		let id;
		try {
			const uploadPromises = [];
			const documentUploadElements = [individualRef.value, representativeRef.value];
			for (const ref of documentUploadElements) {
				if (!ref) {
					continue;
				}

				const { uploadDocuments, namePrefix } = ref;

				const uploadPromise = uploadDocuments(stripePublishableKey).then(
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

			genericError.value = false;

			id = await createPiiToken(data);
		} catch (err: any) {
			// Error from Stripe.
			console.error(err);
			genericError.value = err.message;

			// Rethrow to make sure that no "then" blocks below go through.
			throw err;
		}

		// Override the SSN with the token.
		// This way the raw SSN never hits our server. Only the token.
		if (id) {
			data[`${account.value.type}.id_number`] = id;
		}

		const response = await Api.sendRequest('/web/dash/financials/account', data);
		if (response.success === false) {
			genericError.value = true;
		}

		return response;
	},
});

const representative = computed(() => {
	return getByRelationship('representative');
});

function getByRelationship(relationship: PersonRelationship) {
	if (!stripe.value.persons) {
		return null;
	}

	for (let personId in stripe.value.persons) {
		const person = stripe.value.persons[personId];
		if (person.relationship?.[relationship]) {
			return person;
		}
	}

	return null;
}

// This is only needed after the initial submission in some instances.
const requiresVerificationDocument = computed(() => {
	const personIds = ['individual'];
	personIds.push(...Object.keys(stripe.value.persons || {}));

	for (let personId of personIds) {
		if (
			controller.requiresField(`${personId}.verification.document`) ||
			controller.requiresField(`${personId}.verification.additional_document`)
		) {
			return true;
		}
	}

	return false;
});

const isVerificationPending = computed(() => {
	// If they're in pending state and we don't require more info from them.
	if (!account.value || account.value.status !== UserStripeManagedAccountStatusPending) {
		return false;
	}

	return !requiresVerificationDocument.value;
});

const isComplete = computed(() => {
	if (!account.value?.is_verified) {
		return false;
	}

	const allPersons = Object.values(stripe.value.persons || []);
	if (account.value.type === UserStripeManagedAccountTypeIndividual) {
		allPersons.push(stripe.value.current.individual as any);
	}

	return allPersons.find(person => person.verification.status !== 'verified') === undefined;
});

async function createPiiToken(data: any) {
	if (!data[`${account.value.type}.id_number`]) {
		return null;
	}

	const response = await stripeInst.createToken('pii', {
		personal_id_number: data[`${account.value.type}.id_number`],
	});

	if (response.error) {
		throw response.error;
	}

	return response.token?.id;
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

					<AppExpand :when="!form.formModel.country_code">
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
	:deep(.form-horizontal)
		.form-group
			margin-bottom: 10px

		.control-label
			padding-top: 0
</style>
