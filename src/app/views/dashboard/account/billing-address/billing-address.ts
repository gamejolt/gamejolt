import View from '!view!./billing-address.html';
import { Component } from 'vue-property-decorator';

import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { RouteMutation, RouteStore } from '../account.store';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { Address } from '../../../../../lib/gj-lib-client/components/user/address/address.model';
import { Geo, Region } from '../../../../../lib/gj-lib-client/components/geo/geo.service';
import { ModalConfirm } from '../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { Growls } from '../../../../../lib/gj-lib-client/components/growls/growls.service';
import { UserAddressEditModal } from '../../../../../lib/gj-lib-client/components/user/address/address-edit-modal/address-edit-modal.service';

@View
@Component({
	name: 'RouteDashAccountBillingAddress',
	components: {},
})
export default class RouteDashAccountBillingAddress extends BaseRouteComponent {
	@RouteMutation setHeading: RouteStore['setHeading'];

	countries = Geo.getCountries();
	address: Address | null = null;
	regions: Region[] | null = null;

	@RouteResolve()
	routeResolve(this: undefined) {
		return Api.sendRequest('/web/dash/billing-address');
	}

	get routeTitle() {
		return this.$gettext(`Billing Address`);
	}

	get street() {
		if (this.address) {
			return this.address.street1;
		}
	}

	get country() {
		if (this.address) {
			const country = this.countries.filter(c => c.code === this.address!.country)[0];
			if (country) {
				return country.name;
			}
			return this.address.country;
		}
	}

	get region() {
		if (this.address) {
			if (this.regions) {
				const region = this.regions.filter(r => r.code === this.address!.region)[0];
				if (region) {
					return region.name;
				}
			}
			return this.address.region;
		}
	}

	get postcode() {
		if (this.address) {
			return this.address.postcode;
		}
	}

	routeInit() {
		this.setHeading(this.$gettext('Billing Address'));
	}

	routed($payload: any) {
		if ($payload.address) {
			this.address = new Address($payload.address);
			this.regions = Geo.getRegions(this.address.country) || null;
		}
	}

	async onRemove() {
		if (!this.address) {
			return;
		}

		const modalResult = await ModalConfirm.show(
			'Do you really want to remove your Billing Address? You can add a new one when purchasing a new item.',
			'Remove Billing Address',
			'yes'
		);

		if (modalResult) {
			const result = await this.address.$remove();
			if (result) {
				this.address = null;
				Growls.success(
					'Remove Billing Address',
					'You successfully removed your Billing Address.'
				);
			} else {
				Growls.error('Remove Billing Address', 'Failed to remove your Billing Address.');
			}
		}
	}

	async onEdit() {
		await UserAddressEditModal.show({ address: this.address! });
	}
}
