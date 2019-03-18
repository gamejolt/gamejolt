import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { BaseRouteComponent, RouteResolver } from 'game-jolt-frontend-lib/components/route/route-component';
import { Translate } from 'game-jolt-frontend-lib/components/translate/translate.service';
import { UserAddress } from 'game-jolt-frontend-lib/components/user/address/address.model';
import { arrayRemove } from 'game-jolt-frontend-lib/utils/array';
import { Component } from 'vue-property-decorator';
import AppUserAddressCard from '../../../../components/user/address/card/card.vue';
import { RouteStore, routeStore, RouteStoreModule } from '../account.store';

@Component({
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
