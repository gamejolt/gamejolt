import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { asyncComponentLoader } from 'game-jolt-frontend-lib/utils/utils';

export class UserTokenModal {
	static async show() {
		return await Modal.show<void>({
			modalId: 'UserToken',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "UserTokenModal" */ './token-modal.vue')
				),
			size: 'sm',
			props: {},
		});
	}
}
