import { defineAsyncComponent } from 'vue';
import { Modal } from '../../../../_common/modal/modal.service';

export class UserHeaderModal {
	static async show() {
		return await Modal.show<void>({
			modalId: 'UserHeader',
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "UserHeaderModal" */ './header-modal.vue')
			),
			size: 'sm',
			noBackdropClose: true,
		});
	}
}
