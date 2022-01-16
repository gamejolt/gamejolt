<script lang="ts">
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
</script>

<template>
	<div>
		<div v-if="address.fullname">
			<strong>{{ address.fullname }}</strong>
		</div>

		<div v-if="address.street1">
			{{ address.street1 }}
		</div>

		<div v-if="address.street2">
			{{ address.street2 }}
		</div>

		<div>
			<template v-if="address.city">
				{{ address.city }}
			</template>
			<template v-if="address.region">
				{{ region }}
			</template>
			<template v-if="address.postcode">
				{{ address.postcode }}
			</template>
		</div>

		<div v-if="address.country">
			{{ country }}
		</div>
	</div>
</template>
