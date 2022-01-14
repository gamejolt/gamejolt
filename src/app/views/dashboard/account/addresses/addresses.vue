<script lang="ts">
import { Options } from 'vue-property-decorator';
import { arrayRemove } from '../../../../../utils/array';
import { Api } from '../../../../../_common/api/api.service';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { Translate } from '../../../../../_common/translate/translate.service';
import { UserAddress } from '../../../../../_common/user/address/address.model';
import AppUserAddressCard from '../../../../components/user/address/card/card.vue';
import { RouteStore, routeStore, RouteStoreModule } from '../account.store';

@Options({
	name: 'RouteDashAccountAddresses',
	components: {
		AppUserAddressCard,
	},
})
@RouteResolver({
	deps: {},
	resolver: () => Api.sendRequest('/web/dash/addresses'),
	resolveStore() {
		routeStore.commit('setHeading', Translate.$gettext('Saved Addresses'));
	},
})
export default class RouteDashAccountAddresses extends BaseRouteComponent {
	@RouteStoreModule.State
	heading!: RouteStore['heading'];

	billingAddresses: UserAddress[] = [];

	get routeTitle() {
		return this.heading;
	}

	routeResolved($payload: any) {
		this.billingAddresses = UserAddress.populate($payload.billingAddresses);
	}

	onRemove(address: UserAddress) {
		arrayRemove(this.billingAddresses, i => i.id === address.id);
	}
}
</script>

<template>
	<div v-if="isRouteBootstrapped">
		<div v-if="billingAddresses.length > 0" class="row">
			<div v-for="address of billingAddresses" :key="address.id" class="col-md-6">
				<app-user-address-card :address="address" show-remove @remove="onRemove(address)" />
			</div>
		</div>
		<div v-else class="row">
			<div class="col-md-6 col-centered">
				<p class="lead text-center">
					<translate>You do not have any addresses saved yet.</translate>
				</p>
			</div>
		</div>
	</div>
</template>
