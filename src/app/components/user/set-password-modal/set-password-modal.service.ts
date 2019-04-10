import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { asyncComponentLoader } from 'game-jolt-frontend-lib/utils/utils';

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
