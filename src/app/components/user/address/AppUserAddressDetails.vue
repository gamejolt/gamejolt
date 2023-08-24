<script lang="ts" setup>
import { computed, PropType } from 'vue';
import { Geo } from '../../../../_common/geo/geo.service';
import { UserAddressModel } from '../../../../_common/user/address/address.model';

const props = defineProps({
	address: {
		type: Object as PropType<UserAddressModel>,
		required: true,
	},
});

const country = computed(() => {
	if (props.address) {
		return Geo.getCountryName(props.address.country);
	}
	return undefined;
});

const region = computed(() => {
	if (props.address) {
		return (
			Geo.getRegionName(props.address.country, props.address.region) || props.address.region
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
