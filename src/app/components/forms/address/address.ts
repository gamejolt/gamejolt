import { BaseForm } from '../../../../_common/form-vue/form.service';
import { Geo, Region } from '../../../../_common/geo/geo.service';
import { UserAddress } from '../../../../_common/user/address/address.model';
import { Component, Watch } from 'vue-property-decorator';

@Component({})
export default class FormAddress extends BaseForm<UserAddress> {
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
