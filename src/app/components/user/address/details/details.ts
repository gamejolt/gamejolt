import { Geo } from '../../../../../_common/geo/geo.service';
import { UserAddress } from '../../../../../_common/user/address/address.model';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export default class AppUserAddressDetails extends Vue {
	@Prop(UserAddress) address!: UserAddress;

	get country() {
		if (this.address) {
			return Geo.getCountryName(this.address.country);
		}
	}

	get region() {
		if (this.address) {
			return Geo.getRegionName(this.address.country, this.address.region) || this.address.region;
		}
	}
}
