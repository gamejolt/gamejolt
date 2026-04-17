import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';
import { UserAddressModel } from '~common/user/address/address.model';

export async function showUserAddressEditModal(address: UserAddressModel) {
	return await showModal<UserAddressModel>({
		modalId: 'UserAddressEdit',
		component: defineAsyncComponent(
			() => import('~app/components/user/address/edit-modal/AppUserAddressEditModal.vue')
		),
		size: 'sm',
		props: { address },
		noBackdropClose: true,
	});
}
