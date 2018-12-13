import { Modal } from '../../../../../lib/gj-lib-client/components/modal/modal.service';
import { UserAddress } from '../../../../../lib/gj-lib-client/components/user/address/address.model';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';

export class UserAddressEditModal {
	static async show(address: UserAddress) {
		return await Modal.show<UserAddress>({
			modalId: 'UserAddressEdit',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "UserAddressEditModal" */ './edit-modal')
				),
			size: 'sm',
			props: { address },
			noBackdropClose: true,
		});
	}
}
