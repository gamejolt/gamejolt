import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../../../_common/modal/modal.service';

export class ChatTimersModal {
	static async show() {
		return await showModal<void>({
			modalId: 'ChatTimers',
			component: defineAsyncComponent(() => import('./AppChatTimersModal.vue')),
			noEscClose: true,
			noBackdropClose: true,
			size: 'lg',
		});
	}
}
