import { asyncComponentLoader } from '../../utils/utils';
import { Modal } from '../modal/modal.service';

export class AuthModal {
	static async show() {
		return await Modal.show<void>({
			modalId: 'Auth',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "AuthModal" */ './auth-modal.vue')
				),
			size: 'sm',
			props: {},
			noBackdropClose: true,
		});
	}
}
