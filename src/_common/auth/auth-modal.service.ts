import { defineAsyncComponent } from 'vue';
import { showModal } from '../modal/modal.service';

export class AuthModal {
	static async show() {
		return await showModal<void>({
			modalId: 'Auth',
			component: defineAsyncComponent(() => import('./auth-modal.vue')),
			size: 'sm',
			props: {},
			noBackdropClose: true,
		});
	}
}
