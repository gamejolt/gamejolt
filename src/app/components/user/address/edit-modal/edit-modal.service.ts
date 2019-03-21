import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { UserAddress } from 'game-jolt-frontend-lib/components/user/address/address.model';
import { asyncComponentLoader } from 'game-jolt-frontend-lib/utils/utils';

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
