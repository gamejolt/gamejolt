import { Modal } from '../../../../_common/modal/modal.service';
import { asyncComponentLoader } from '../../../../utils/utils';

export class UserHeaderModal {
	static async show() {
		return await Modal.show<void>({
			modalId: 'UserHeader',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "UserHeaderModal" */ './header-modal.vue')
				),
			size: 'sm',
		});
	}
}
