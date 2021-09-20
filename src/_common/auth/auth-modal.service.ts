import { asyncComponentLoader } from '../../utils/utils';
import { Analytics } from '../analytics/analytics.service';
import { Modal } from '../modal/modal.service';

export class AuthModal {
	static async show() {
		Analytics.trackEvent('auth-required-modal', 'shown');

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
