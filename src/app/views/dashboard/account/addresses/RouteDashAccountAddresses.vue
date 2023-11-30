<script lang="ts">
import { ref } from 'vue';
import { Api } from '../../../../../_common/api/api.service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { UserAddressModel } from '../../../../../_common/user/address/address.model';
import { arrayRemove } from '../../../../../utils/array';
import AppUserAddressCard from '../../../../components/user/address/AppUserAddressCard.vue';
import { useAccountRouteController } from '../RouteDashAccount.vue';

export default {
	...defineAppRouteOptions({
		deps: {},
		resolver: () => Api.sendRequest('/web/dash/addresses'),
	}),
};
</script>

<script lang="ts" setup>
const { heading } = useAccountRouteController()!;

const billingAddresses = ref<UserAddressModel[]>([]);

function onRemove(address: UserAddressModel) {
	arrayRemove(billingAddresses.value, i => i.id === address.id);
}

const { isBootstrapped } = createAppRoute({
	routeTitle: heading,
	onInit() {
		heading.value = $gettext('Saved Addresses');
	},
	onResolved({ payload }) {
		billingAddresses.value = UserAddressModel.populate(payload.billingAddresses);
	},
});
</script>

<template>
	<div v-if="isBootstrapped">
		<div v-if="billingAddresses.length > 0" class="row">
			<div v-for="address of billingAddresses" :key="address.id" class="col-md-6">
				<AppUserAddressCard :address="address" show-remove @remove="onRemove(address)" />
			</div>
		</div>
		<div v-else class="row">
			<div class="col-md-6 col-centered">
				<p class="lead text-center">
					{{ $gettext(`You do not have any addresses saved yet.`) }}
				</p>
			</div>
		</div>
	</div>
</template>
