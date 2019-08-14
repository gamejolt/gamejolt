import { Component } from 'vue-property-decorator';
import { arrayRemove } from '../../../../../utils/array';
import { Api } from '../../../../../_common/api/api.service';
import { BaseRouteComponent, RouteResolver } from '../../../../../_common/route/route-component';
import { Translate } from '../../../../../_common/translate/translate.service';
import { UserAddress } from '../../../../../_common/user/address/address.model';
import AppUserAddressCard from '../../../user/address/card/card.vue';
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
