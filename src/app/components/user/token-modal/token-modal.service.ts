import { Modal } from '../../../../lib/gj-lib-client/components/modal/modal.service';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export class UserTokenModal {
	static async show() {
		return await Modal.show<void>({
			modalId: 'UserToken',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "UserTokenModal" */ './token-modal')
				),
			size: 'sm',
			props: {},
		});
	}
}
