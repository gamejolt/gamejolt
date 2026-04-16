<script lang="ts" setup>
import { computed } from 'vue';

import { Geo } from '../../../../_common/geo/geo.service';
import { UserAddressModel } from '../../../../_common/user/address/address.model';

type Props = {
	address: UserAddressModel;
};
const { address } = defineProps<Props>();

const country = computed(() => {
	if (address) {
		return Geo.getCountryName(address.country);
	}
	return undefined;
});

const region = computed(() => {
	if (address) {
		return (
			Geo.getRegionName(address.country, address.region) || address.region
		);
	}
	return undefined;
});
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
				{{ address.city + ' ' }}
			</template>
			<template v-if="address.region">
				{{ region + ' ' }}
			</template>
			<template v-if="address.postcode">
				{{ address.postcode + ' ' }}
			</template>
		</div>

		<div v-if="address.country">
			{{ country }}
		</div>
	</div>
</template>
