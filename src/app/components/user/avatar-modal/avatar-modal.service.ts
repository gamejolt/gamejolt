import { asyncComponentLoader } from '../../../../utils/utils';
import { Modal } from '../../../../_common/modal/modal.service';

export class UserAvatarModal {
	static async show() {
		return await Modal.show<void>({
			modalId: 'UserAvatar',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "UserAvatarModal" */ './avatar-modal.vue')
				),
			size: 'sm',
			noBackdropClose: true,
		});
	}
}
