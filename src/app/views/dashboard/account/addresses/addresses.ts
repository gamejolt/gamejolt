import View from '!view!./addresses.html';
import { Translate } from 'game-jolt-frontend-lib/components/translate/translate.service';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { UserAddress } from '../../../../../lib/gj-lib-client/components/user/address/address.model';
import { arrayRemove } from '../../../../../lib/gj-lib-client/utils/array';
import { AppUserAddressCard } from '../../../../components/user/address/card/card';
import { RouteStore, routeStore, RouteStoreModule } from '../account.store';

@View
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
