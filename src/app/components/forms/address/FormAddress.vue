<script lang="ts" setup>
import { ref, watch } from 'vue';

import AppForm, { createForm } from '../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlSelect from '../../../../_common/form-vue/controls/AppFormControlSelect.vue';
import { Geo, GeoRegion } from '../../../../_common/geo/geo.service';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { $saveUserAddress, UserAddressModel } from '../../../../_common/user/address/address.model';

const countries = Geo.getCountries();
const regions = ref<GeoRegion[] | null>(null);
let initialLoad = true;

const form = createForm<UserAddressModel>({
	modelClass: UserAddressModel,
	modelSaveHandler: $saveUserAddress,
});

watch(
	() => form.formModel.country,
	() => {
		regions.value = Geo.getRegions(form.formModel.country || '') || null;
		if (regions.value) {
			if (!regions.value.some(r => r.code === form.formModel.region)) {
				form.formModel.region = regions.value[0].code;
			}
		} else if (!initialLoad) {
			form.formModel.region = '';
		}
		initialLoad = false;
	}
);
</script>

<template>
	<AppForm :controller="form">
		<div class="row">
			<div class="col-sm-6">
				<AppFormGroup name="country" :label="$gettext('Country')">
					<AppFormControlSelect>
						<option
							v-for="country of countries"
							:key="country.code"
							:value="country.code"
						>
							{{ country.name }}
						</option>
					</AppFormControlSelect>
					<AppFormControlErrors />
				</AppFormGroup>
			</div>
		</div>

		<AppFormGroup name="street1" :label="$gettext('Street Address')">
			<AppFormControl type="text" />
			<AppFormControlErrors />
		</AppFormGroup>

		<div class="row">
			<div class="col-sm-6">
				<AppFormGroup name="region" :label="$gettext('State/Province/County')">
					<AppFormControl v-if="!regions" type="text" />

					<AppFormControlSelect v-else>
						<option v-for="region of regions" :key="region.code" :value="region.code">
							{{ region.name }}
						</option>
					</AppFormControlSelect>

					<AppFormControlErrors />
				</AppFormGroup>
			</div>
			<div class="col-sm-6">
				<AppFormGroup name="postcode" :label="$gettext('Zip/Postal Code')">
					<AppFormControl type="text" />
					<AppFormControlErrors />
				</AppFormGroup>
			</div>
		</div>

		<AppFormButton show-when-valid>
			<AppTranslate>Save</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
