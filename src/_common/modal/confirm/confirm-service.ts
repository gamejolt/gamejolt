import { asyncComponentLoader } from '../../../utils/utils';
import { Modal } from '../modal.service';

export class ModalConfirm {
	static async show(message: string, title = 'Confirm...', buttonType: 'ok' | 'yes' = 'ok') {
		return await Modal.show<boolean>({
			modalId: 'Confirm',
			size: 'sm',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "ModalConfirm" */ './confirm.vue')
				),
			props: { message, title, buttonType },
		});
	}
}
