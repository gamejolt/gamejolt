import { Options, Prop, Vue } from 'vue-property-decorator';
import { Geo } from '../../../../../_common/geo/geo.service';
import { UserAddress } from '../../../../../_common/user/address/address.model';

@Options({})
export default class AppUserAddressDetails extends Vue {
	@Prop(Object) address!: UserAddress;

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
