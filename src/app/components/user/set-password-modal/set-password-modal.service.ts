import { Modal } from '../../../../lib/gj-lib-client/components/modal/modal.service';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export class UserSetPasswordModal {
	static async show() {
		return await Modal.show<boolean>({
			modalId: 'UserSetPassword',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "UserSetPasswordModal" */ './set-password-modal')
				),
			size: 'sm',
			props: {},
		});
	}
}
