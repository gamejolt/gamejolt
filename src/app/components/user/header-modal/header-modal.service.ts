import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../_common/modal/modal.service';

export class UserHeaderModal {
	static async show() {
		return await showModal<void>({
			modalId: 'UserHeader',
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "UserHeaderModal" */ './header-modal.vue')
			),
			size: 'sm',
			noBackdropClose: true,
		});
	}
}
