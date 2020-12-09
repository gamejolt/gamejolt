import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { Action, Mutation } from 'vuex-class';
import { Country, Geo, Region } from '../../../_common/geo/geo.service';
import { AddressData, Store } from '../../store/index';

@Component({})
export default class AppAddress extends Vue {
	@Mutation setAddress!: Store['setAddress'];
	@Action checkout!: Store['checkout'];

	address = {
		country: 'us',
		region: '',
		street1: '',
		postcode: '',
	};

	countries: Country[] = [];
	regions: Region[] | null = [];

	// From the form library.
	errors: any;

	created() {
		this.countries = Geo.getCountries();
		this.countryChanged();
	}

	countryChanged() {
		this.regions = Geo.getRegions(this.address.country) || null;

		if (this.regions) {
			this.address.region = this.regions[0].code;
		} else {
			this.address.region = '';
		}
	}

	submit() {
		const addressData = Object.assign(new AddressData(), this.address);
		this.setAddress(addressData);
		this.checkout();
	}
}
