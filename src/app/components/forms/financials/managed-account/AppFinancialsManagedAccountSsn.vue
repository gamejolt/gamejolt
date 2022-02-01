<script lang="ts" setup>
import { validatePattern } from '../../../../../_common/form-vue/validators';
import { useFormManagedAccount } from './managed-account.vue';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import AppFormGroup from '../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlErrors from '../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormControl from '../../../../../_common/form-vue/AppFormControl.vue';

defineProps({
	namePrefix: {
		type: String,
		required: true,
	},
	countryCode: {
		type: String,
		required: true,
	},
	isForceRequired: {
		type: Boolean,
	},
});

const { requiresField, getStripeField } = useFormManagedAccount()!;
</script>

<template>
	<div>
		<template v-if="requiresField(namePrefix + '.id_number')">
			<AppFormGroup
				v-if="!getStripeField(namePrefix + '.id_number_provided')"
				:name="`${namePrefix}.id_number`"
				:label="
					countryCode === 'us'
						? 'Social Security Number or ITIN'
						: 'Foreign Tax Identification Number'
				"
			>
				<p v-if="countryCode === 'us'" class="help-block">
					<AppTranslate>
						We are required by the IRS to collect your Social Security Number (SSN) or
						Individual Taxpayer Identification Number (ITIN) for tax purposes. For
						security reasons, we use Stripe to store this information, it will not be
						stored on Game Jolt's servers.
					</AppTranslate>
				</p>

				<p v-if="countryCode !== 'us'" class="help-block">
					<AppTranslate>
						We are required by the IRS to collect your Tax Identification Number (TIN)
						for tax purposes. For security reasons, we use Stripe to store this
						information, it will not be stored on Game Jolt's servers.
					</AppTranslate>
				</p>

				<AppFormControl />
				<AppFormControlErrors />
			</AppFormGroup>

			<div v-if="getStripeField(namePrefix + '.id_number_provided')" class="form-horizontal">
				<div class="form-group">
					<label class="control-label col-sm-4">
						<template v-if="countryCode === 'us'">
							<AppTranslate>SSN/ITIN</AppTranslate>
						</template>
						<template v-if="countryCode !== 'us'">
							<AppTranslate>Foreign Tax Identification Number</AppTranslate>
						</template>
					</label>
					<div class="form-static col-sm-8">
						<AppTranslate>Provided</AppTranslate>
					</div>
				</div>
			</div>
		</template>

		<template v-else-if="requiresField(namePrefix + '.ssn_last_4')">
			<AppFormGroup
				v-if="!getStripeField(namePrefix + '.ssn_last_4_provided')"
				:name="`${namePrefix}.ssn_last_4`"
				:label="
					countryCode === 'us'
						? 'Social Security Number or ITIN - Last 4 Digits'
						: 'Foreign Tax Identification Number - Last 4 Digits'
				"
			>
				<p v-if="countryCode === 'us'" class="help-block">
					<AppTranslate>
						We are required by the IRS to collect a Social Security Number (SSN) or
						Individual Taxpayer Identification Number (ITIN) for tax purposes. For
						security reasons, we use Stripe to store this information, it will not be
						stored on Game Jolt's servers.
					</AppTranslate>
				</p>

				<p v-if="countryCode !== 'us'" class="help-block">
					<AppTranslate>
						We are required by the IRS to collect a Tax Identification Number (TIN) for
						tax purposes. For security reasons, we use Stripe to store this information,
						it will not be stored on Game Jolt's servers.
					</AppTranslate>
				</p>

				<AppFormControl
					type="text"
					placeholder="1234"
					:validators="[validatePattern(/^\d{4}/)]"
				/>
				<AppFormControlErrors
					:label="
						$gettext(
							countryCode === 'us'
								? '4 digits of SSN / ITIN'
								: '4 digits of Foreign Tax ID'
						)
					"
				/>
			</AppFormGroup>

			<div v-if="getStripeField(namePrefix + '.ssn_last_4_provided')" class="form-horizontal">
				<div class="form-group">
					<label class="control-label col-sm-4">
						<template v-if="countryCode === 'us'">
							<AppTranslate>SSN/ITIN - Last 4</AppTranslate>
						</template>
						<template v-if="countryCode !== 'us'">
							<AppTranslate>Foreign Tax Identification Number - Last 4</AppTranslate>
						</template>
					</label>
					<div class="form-static col-sm-8">
						<AppTranslate>Provided</AppTranslate>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>
