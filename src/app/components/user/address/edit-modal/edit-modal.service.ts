import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../../_common/modal/modal.service';
import { UserAddress } from '../../../../../_common/user/address/address.model';

export class UserAddressEditModal {
	static async show(address: UserAddress) {
		return await showModal<UserAddress>({
			modalId: 'UserAddressEdit',
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "UserAddressEditModal" */ './edit-modal.vue')
			),
			size: 'sm',
			props: { address },
			noBackdropClose: true,
		});
	}
}
