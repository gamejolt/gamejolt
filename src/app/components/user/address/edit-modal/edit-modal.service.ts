import { Modal } from '../../../../../_common/modal/modal.service';
import { UserAddress } from '../../../../../_common/user/address/address.model';
import { asyncComponentLoader } from '../../../../../utils/utils';

export class UserAddressEditModal {
	static async show(address: UserAddress) {
		return await Modal.show<UserAddress>({
			modalId: 'UserAddressEdit',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "UserAddressEditModal" */ './edit-modal.vue')
				),
			size: 'sm',
			props: { address },
			noBackdropClose: true,
		});
	}
}
