import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { asyncComponentLoader } from 'game-jolt-frontend-lib/utils/utils';

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
