import { defineAsyncComponent } from 'vue';
import { Modal } from '../../../../_common/modal/modal.service';

export class UserSetPasswordModal {
	static async show() {
		return await Modal.show<boolean>({
			modalId: 'UserSetPassword',
			component: defineAsyncComponent(
				() =>
					import(
						/* webpackChunkName: "UserSetPasswordModal" */ './set-password-modal.vue'
					)
			),
			size: 'sm',
			props: {},
		});
	}
}
