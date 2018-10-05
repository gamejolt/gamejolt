import View from '!view!./addresses.html';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { UserAddress } from '../../../../../lib/gj-lib-client/components/user/address/address.model';
import { arrayRemove } from '../../../../../lib/gj-lib-client/utils/array';
import { AppUserAddressCard } from '../../../../components/user/address/card/card';
import { RouteMutation, RouteStore } from '../account.store';

@View
@Component({
	name: 'RouteDashAccountAddresses',
	components: {
		AppUserAddressCard,
	},
})
export default class RouteDashAccountAddresses extends BaseRouteComponent {
	@RouteMutation
	setHeading!: RouteStore['setHeading'];

	billingAddresses: UserAddress[] = [];

	@RouteResolve({
		deps: {},
	})
	routeResolve(this: undefined) {
		return Api.sendRequest('/web/dash/addresses');
	}

	get routeTitle() {
		return this.$gettext(`Saved Addresses`);
	}

	routeInit() {
		this.setHeading(this.routeTitle);
	}

	routed($payload: any) {
		this.billingAddresses = UserAddress.populate($payload.billingAddresses);
	}

	onRemove(address: UserAddress) {
		arrayRemove(this.billingAddresses, i => i.id === address.id);
	}
}
