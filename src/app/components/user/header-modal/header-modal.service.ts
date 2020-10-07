import { asyncComponentLoader } from '../../../../utils/utils';
import { Modal } from '../../../../_common/modal/modal.service';

export class UserHeaderModal {
	static async show() {
		return await Modal.show<void>({
			modalId: 'UserHeader',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "UserHeaderModal" */ './header-modal.vue')
				),
			size: 'sm',
			noBackdropClose: true,
		});
	}
}
