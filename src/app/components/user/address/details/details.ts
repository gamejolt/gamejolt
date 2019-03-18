import { Geo } from 'game-jolt-frontend-lib/components/geo/geo.service';
import { UserAddress } from 'game-jolt-frontend-lib/components/user/address/address.model';
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
