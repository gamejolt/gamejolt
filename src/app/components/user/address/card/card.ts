import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import View from '!view!./card.html';
import { AppCard } from '../../../../../lib/gj-lib-client/components/card/card';
import { UserAddress } from '../../../../../lib/gj-lib-client/components/user/address/address.model';
import { Geo } from '../../../../../lib/gj-lib-client/components/geo/geo.service';
import { UserAddressEditModal } from '../edit-modal/edit-modal.service';
import { ModalConfirm } from '../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import { Growls } from '../../../../../lib/gj-lib-client/components/growls/growls.service';

@View
@Component({
	components: {
		AppCard,
	},
})
export class AppUserAddressCard extends Vue {
	@Prop(UserAddress) address: UserAddress;
	@Prop(Boolean) showRemove?: boolean;

	@Emit('remove')
	emitRemove() {}

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

	edit() {
		UserAddressEditModal.show(this.address);
	}

	async remove() {
		const result = await ModalConfirm.show(
			`Are you sure you want to remove this address?`,
			undefined,
			'yes'
		);
		if (!result) {
			return;
		}

		await this.address.$remove();

		Growls.success(
			this.$gettext(`Your address has successfully been removed.`),
			this.$gettext(`Address Removed`)
		);

		this.emitRemove();
	}
}
