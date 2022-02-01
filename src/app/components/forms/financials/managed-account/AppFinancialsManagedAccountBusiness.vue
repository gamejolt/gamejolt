<script lang="ts" setup>
import { useFormManagedAccount } from './managed-account.vue';
import AppFormGroup from '../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControl from '../../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';

const { getStripeField, requiresField } = useFormManagedAccount()!;
</script>

<template>
	<div>
		<div v-if="!getStripeField('company.name')">
			<div class="row">
				<div v-if="requiresField('company.name')" class="col-sm-6">
					<AppFormGroup name="company.name" :label="$gettext('Business Name')">
						<AppFormControl />
						<AppFormControlErrors />
					</AppFormGroup>
				</div>
				<div v-if="requiresField('company.tax_id')" class="col-sm-6">
					<AppFormGroup
						name="company.tax_id"
						:label="$gettext('Employer Identification Number')"
					>
						<AppFormControl />
						<AppFormControlErrors />
					</AppFormGroup>
				</div>
			</div>
		</div>

		<div v-if="getStripeField('company.name')" class="form-horizontal">
			<div class="form-group">
				<label class="control-label col-sm-4">
					<AppTranslate>Business Name</AppTranslate>
				</label>
				<div class="form-static col-sm-8">
					{{ getStripeField('company.name') }}
				</div>
			</div>
			<div class="form-group">
				<label class="control-label col-sm-4">
					<AppTranslate>Employer Identification Number</AppTranslate>
				</label>
				<div class="form-static col-sm-8">
					<AppTranslate>Provided</AppTranslate>
				</div>
			</div>
		</div>
	</div>
</template>
