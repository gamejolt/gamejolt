<script lang="ts">
import { mixins, Options, Watch } from 'vue-property-decorator';
import { BaseForm } from '../../../../_common/form-vue/form.service';
import { Geo, Region } from '../../../../_common/geo/geo.service';
import { UserAddress } from '../../../../_common/user/address/address.model';

class Wrapper extends BaseForm<UserAddress> {}

@Options({})
export default class FormAddress extends mixins(Wrapper) {
	modelClass = UserAddress;

	countries = Geo.getCountries();
	regions: Region[] | null = null;
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
	<app-form :controller="form">
		<div class="row">
			<div class="col-sm-6">
				<app-form-group name="country" :label="$gettext('Country')">
					<app-form-control-select>
						<option
							v-for="country of countries"
							:key="country.code"
							:value="country.code"
						>
							{{ country.name }}
						</option>
					</app-form-control-select>
					<app-form-control-errors />
				</app-form-group>
			</div>
		</div>

		<app-form-group name="street1" :label="$gettext('Street Address')">
			<app-form-control type="text" />
			<app-form-control-errors />
		</app-form-group>

		<div class="row">
			<div class="col-sm-6">
				<app-form-group name="region" :label="$gettext('State/Province/County')">
					<app-form-control v-if="!regions" type="text" />

					<app-form-control-select v-else>
						<option v-for="region of regions" :key="region.code" :value="region.code">
							{{ region.name }}
						</option>
					</app-form-control-select>

					<app-form-control-errors />
				</app-form-group>
			</div>
			<div class="col-sm-6">
				<app-form-group name="postcode" :label="$gettext('Zip/Postal Code')">
					<app-form-control type="text" />
					<app-form-control-errors />
				</app-form-group>
			</div>
		</div>

		<app-form-button show-when-valid>
			<translate>Save</translate>
		</app-form-button>
	</app-form>
</template>
