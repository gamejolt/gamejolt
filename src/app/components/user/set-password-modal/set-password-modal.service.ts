import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../_common/modal/modal.service';

export class UserSetPasswordModal {
	static async show() {
		return await showModal<boolean>({
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
