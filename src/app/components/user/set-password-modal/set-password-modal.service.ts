import { Modal } from '../../../../_common/modal/modal.service';
import { asyncComponentLoader } from '../../../../utils/utils';

export class UserSetPasswordModal {
	static async show() {
		return await Modal.show<boolean>({
			modalId: 'UserSetPassword',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "UserSetPasswordModal" */ './set-password-modal.vue')
				),
			size: 'sm',
			props: {},
		});
	}
}
