<script lang="ts" setup>
import AppFormControlErrors from '../../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlSelect from '../../../../../_common/form-vue/controls/AppFormControlSelect.vue';
import AppTranslate from '../../../../../_common/translate/AppTranslate.vue';
import { useFormManagedAccount } from './managed-account.vue';

defineProps({
	namePrefix: {
		type: String,
		required: true,
	},
});

const { getStripeField, requiresField } = useFormManagedAccount()!;

const days: string[] = [];
const years: string[] = [];

for (let i = 1; i <= 31; ++i) {
	days.push('' + i);
}

const maxYear = new Date().getFullYear() - 13;
for (let i = maxYear; i > maxYear - 100; --i) {
	years.push('' + i);
}

if (GJ_ENVIRONMENT !== 'production') {
	// Needed to test stripe. They have special cases for DOB for testing.
	years.push('1902', '1901', '1900');
}
</script>

<template>
	<div>
		<div
			v-if="
				!getStripeField(namePrefix + '.year') &&
				(requiresField(namePrefix + '.year') ||
					requiresField(namePrefix + '.month') ||
					requiresField(namePrefix + '.day'))
			"
		>
			<div>
				<label class="control-label"><AppTranslate>Date of Birth</AppTranslate></label>
			</div>

			<div class="row">
				<div v-if="requiresField(namePrefix + '.month')" class="col-sm-4">
					<AppFormGroup
						:name="`${namePrefix}.month`"
						:label="$gettext('Month')"
						:hide-label="true"
					>
						<AppFormControlSelect>
							<option value=""><AppTranslate>Month</AppTranslate></option>
							<option value="1"><AppTranslate>January</AppTranslate></option>
							<option value="2"><AppTranslate>February</AppTranslate></option>
							<option value="3"><AppTranslate>March</AppTranslate></option>
							<option value="4"><AppTranslate>April</AppTranslate></option>
							<option value="5"><AppTranslate>May</AppTranslate></option>
							<option value="6"><AppTranslate>June</AppTranslate></option>
							<option value="7"><AppTranslate>July</AppTranslate></option>
							<option value="8"><AppTranslate>August</AppTranslate></option>
							<option value="9"><AppTranslate>September</AppTranslate></option>
							<option value="10"><AppTranslate>October</AppTranslate></option>
							<option value="11"><AppTranslate>November</AppTranslate></option>
							<option value="12"><AppTranslate>December</AppTranslate></option>
						</AppFormControlSelect>

						<AppFormControlErrors />
					</AppFormGroup>
				</div>
				<div v-if="requiresField(namePrefix + '.day')" class="col-sm-4">
					<AppFormGroup :name="`${namePrefix}.day`" :label="$gettext('Day')" hide-label>
						<AppFormControlSelect>
							<option value=""><AppTranslate>Day</AppTranslate></option>
							<option v-for="i of days" :key="i" :value="i">
								{{ i }}
							</option>
						</AppFormControlSelect>

						<AppFormControlErrors />
					</AppFormGroup>
				</div>
				<div v-if="requiresField(namePrefix + '.year')" class="col-sm-4">
					<AppFormGroup
						:name="`${namePrefix}.year`"
						:label="$gettext('Year')"
						:hide-label="true"
					>
						<AppFormControlSelect>
							<option value=""><AppTranslate>Year</AppTranslate></option>
							<option v-for="i of years" :key="i" :value="i">
								{{ i }}
							</option>
						</AppFormControlSelect>

						<AppFormControlErrors />
					</AppFormGroup>
				</div>
			</div>
		</div>

		<div v-if="getStripeField(namePrefix + '.year')" class="form-horizontal">
			<div class="form-group">
				<label class="control-label col-sm-4">
					<AppTranslate>Date of Birth</AppTranslate>
				</label>
				<div class="form-static col-sm-8">
					<AppTranslate>Provided</AppTranslate>
				</div>
			</div>
		</div>
	</div>
</template>
