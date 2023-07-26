<script lang="ts">
import { mixins, Options, Watch } from 'vue-property-decorator';
import { BaseForm } from '../../../../_common/form-vue/form.service';
import { Geo, GeoRegion } from '../../../../_common/geo/geo.service';
import { UserAddress } from '../../../../_common/user/address/address.model';

class Wrapper extends BaseForm<UserAddress> {}

@Options({})
export default class FormAddress extends mixins(Wrapper) {
	modelClass = UserAddress;

	countries = Geo.getCountries();
	regions: GeoRegion[] | null = null;
	initialLoad = true;

	@Watch('formModel.country')
	onCountryChange() {
		this.regions = Geo.getRegions(this.formModel.country || '') || null;
		if (this.regions) {
			if (!this.regions.some(r => r.code === this.formModel.region)) {
				this.setField('region', this.regions[0].code); // Default to first.
			}
		} else if (!this.initialLoad) {
			// accept the initial value in this field
			this.setField('region', '');
		}
		this.initialLoad = false;
	}
}
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
