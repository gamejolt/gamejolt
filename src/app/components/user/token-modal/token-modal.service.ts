import { Modal } from '../../../../_common/modal/modal.service';
import { asyncComponentLoader } from '../../../../utils/utils';

export class UserTokenModal {
	static async show() {
		return await Modal.show<void>({
			modalId: 'UserToken',
			component: () =>
				asyncComponentLoader(import(/* webpackChunkName: "UserTokenModal" */ './token-modal.vue')),
			size: 'sm',
			props: {},
		});
	}
}
