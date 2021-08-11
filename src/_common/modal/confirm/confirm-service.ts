import { defineAsyncComponent } from 'vue';
import { Modal } from '../modal.service';

export class ModalConfirm {
	static async show(message: string, title = 'Confirm...', buttonType: 'ok' | 'yes' = 'yes') {
		return await Modal.show<boolean>({
			modalId: 'Confirm',
			size: 'sm',
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "ModalConfirm" */ './confirm.vue')
			),
			props: { message, title, buttonType },
		});
	}
}
