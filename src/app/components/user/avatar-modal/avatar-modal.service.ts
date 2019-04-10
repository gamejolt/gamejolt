import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { asyncComponentLoader } from 'game-jolt-frontend-lib/utils/utils';

export class UserAvatarModal {
	static async show() {
		return await Modal.show<void>({
			modalId: 'UserAvatar',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "UserAvatarModal" */ './avatar-modal.vue')
				),
			size: 'sm',
		});
	}
}
