import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./details.html';
import { UserAddress } from '../../../../../lib/gj-lib-client/components/user/address/address.model';
import { Geo } from '../../../../../lib/gj-lib-client/components/geo/geo.service';

@View
@Component({})
export class AppUserAddressDetails extends Vue {
	@Prop(UserAddress) address: UserAddress;

	get country() {
		if (this.address) {
			return Geo.getCountryName(this.address.country);
		}
	}

	get region() {
		if (this.address) {
			return (
				Geo.getRegionName(this.address.country, this.address.region) || this.address.region
			);
		}
	}
}
