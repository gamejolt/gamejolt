import { Modal } from '../../../../lib/gj-lib-client/components/modal/modal.service';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export class UserAvatarModal {
	static async show() {
		return await Modal.show<void>({
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "UserAvatarModal" */ './avatar-modal')
				),
			size: 'sm',
		});
	}
}
