<script lang="ts" setup>
import { computed, shallowRef } from 'vue';
import AppForm, { FormController, createForm } from '../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../_common/form-vue/AppFormControl.vue';
import AppFormGroup from '../../../_common/form-vue/AppFormGroup.vue';
import AppFormControlSelect from '../../../_common/form-vue/controls/AppFormControlSelect.vue';
import { Geo, GeoCountry, GeoRegion } from '../../../_common/geo/geo.service';
import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import { AddressData, useWidgetPackageStore } from '../../store/index';

interface FormModel {
	country: string;
	region: string;
	street1: string;
	postcode: string;
}

const { address, checkout } = useWidgetPackageStore();

const countries = shallowRef<GeoCountry[]>(Geo.getCountries());
const regions = shallowRef<GeoRegion[] | undefined>([]);

const form: FormController<FormModel> = createForm({
	onInit: () => {
		form.formModel.country = 'us';
		countryChanged();
	},
	onSubmit: async () => {
		const addressData = Object.assign(new AddressData(), form.formModel);
		address.value = addressData;
		checkout();
	},
});

function countryChanged() {
	regions.value = Geo.getRegions(form.formModel.country) || undefined;

	if (regions.value) {
		form.formModel.region = regions.value[0].code;
	} else {
		form.formModel.region = '';
	}
}

const formError = computed(() => {
	for (const { error, humanLabel } of form._groups) {
		if (error.value) {
			return error.value.message.replace(/\{\}/g, humanLabel.value.toLocaleLowerCase());
		}
	}
	return undefined;
});
</script>

<template>
	<div>
		<p>
			<AppJolticon icon="info-circle" middle />
			Because of international tax laws, we are required to collect this information.
		</p>

		<AppForm :controller="form">
			<AppFormGroup name="country" label="Country" hide-label>
				<AppFormControlSelect @changed="countryChanged">
					<option v-for="country of countries" :key="country.code" :value="country.code">
						{{ country.name }}
					</option>
				</AppFormControlSelect>
			</AppFormGroup>

			<AppFormGroup name="street1" label="Street Address" hide-label>
				<AppFormControl placeholder="Street Address" />
			</AppFormGroup>

			<div class="row">
				<div class="col-xs-4">
					<AppFormGroup name="region" label="State/Province" hide-label>
						<template v-if="!regions">
							<AppFormControl placeholder="State/Province" />
						</template>
						<template v-else>
							<AppFormControlSelect>
								<option
									v-for="region in regions"
									:key="region.code"
									:value="region.code"
								>
									{{ region.name }}
								</option>
							</AppFormControlSelect>
						</template>
					</AppFormGroup>
				</div>
				<div class="col-xs-4">
					<AppFormGroup name="postcode" label="Zip/Postal Code" hide-label>
						<AppFormControl placeholder="Zip/Postal Code" />
					</AppFormGroup>
				</div>
			</div>

			<div v-if="formError" class="form-errors">
				<div class="alert alert-notice">
					<AppJolticon icon="notice" middle />
					{{ formError }}
				</div>
			</div>
			<div v-else>
				<AppFormButton :disabled="form.invalid">Proceed to PayPal</AppFormButton>
			</div>
		</AppForm>
	</div>
</template>

<style lang="stylus" scoped>
.address-form
	position: absolute
	top: 0
	left: 0
	right: 0
	bottom: 30px // Make room for footer.
	padding: $shell-padding
	z-index: 1
</style>
