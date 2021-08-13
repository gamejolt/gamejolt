import { defineAsyncComponent } from '@vue/runtime-core';
import { showModal } from '../modal/modal.service';

export class AuthModal {
	static async show() {
		return await showModal<void>({
			modalId: 'Auth',
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "AuthModal" */ './auth-modal.vue')
			),
			size: 'sm',
			props: {},
			noBackdropClose: true,
		});
	}
}
