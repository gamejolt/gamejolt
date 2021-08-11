import { defineAsyncComponent } from 'vue';
import { Modal } from '../../modal/modal.service';
import { FacebookPage, LinkedAccount } from '../linked-account.model';

export class ModalFacebookPageSelector {
	static async show(message: string, account: LinkedAccount, title = 'Confirm...') {
		return await Modal.show<FacebookPage | false>({
			modalId: 'FacebookPageSelector',
			size: 'sm',
			component: defineAsyncComponent(
				() =>
					import(
						/* webpackChunkName: "ModalFacebookPageSelector" */ './facebook-page-selector-modal.vue'
					)
			),
			props: { message, account, title },
		});
	}
}
