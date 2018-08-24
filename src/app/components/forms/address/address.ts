import { Watch, Component } from 'vue-property-decorator';
import View from '!view!./address.html';
import { BaseForm } from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { UserAddress } from '../../../../lib/gj-lib-client/components/user/address/address.model';
import { Geo, Region } from '../../../../lib/gj-lib-client/components/geo/geo.service';

@View
@Component({})
export class FormAddress extends BaseForm<UserAddress> {
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
