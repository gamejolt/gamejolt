import AppCard from '../../../../../_common/card/card.vue';
import { Growls } from '../../../../../_common/growls/growls.service';
import { ModalConfirm } from '../../../../../_common/modal/confirm/confirm-service';
import { UserAddress } from '../../../../../_common/user/address/address.model';
import Vue from 'vue';
import { Component, Emit, Prop } from 'vue-property-decorator';
import AppUserAddressDetails from '../details/details.vue';
import { UserAddressEditModal } from '../edit-modal/edit-modal.service';

@Component({
	components: {
		AppCard,
		AppUserAddressDetails,
	},
})
export default class AppUserAddressCard extends Vue {
	@Prop(UserAddress) address!: UserAddress;
	@Prop(Boolean) showRemove?: boolean;

	@Emit('remove')
	emitRemove() {}

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
