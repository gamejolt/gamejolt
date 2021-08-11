import { defineAsyncComponent } from 'vue';
import { Modal } from '../../../../_common/modal/modal.service';

export class UserTokenModal {
	static async show() {
		return await Modal.show<void>({
			modalId: 'UserToken',
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "UserTokenModal" */ './token-modal.vue')
			),
			size: 'sm',
			props: {},
		});
	}
}
