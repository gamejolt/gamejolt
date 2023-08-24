import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../../_common/modal/modal.service';
import { UserAddressModel } from '../../../../../_common/user/address/address.model';

export class UserAddressEditModal {
	static async show(address: UserAddressModel) {
		return await showModal<UserAddressModel>({
			modalId: 'UserAddressEdit',
			component: defineAsyncComponent(() => import('./edit-modal.vue')),
			size: 'sm',
			props: { address },
			noBackdropClose: true,
		});
	}
}
