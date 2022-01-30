import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../_common/modal/modal.service';

export class UserTokenModal {
	static async show() {
		return await showModal<void>({
			modalId: 'UserToken',
			component: defineAsyncComponent(() => import('./token-modal.vue')),
			size: 'sm',
			props: {},
		});
	}
}
