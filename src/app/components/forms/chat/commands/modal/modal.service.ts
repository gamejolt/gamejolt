import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../../../_common/modal/modal.service';

export class ChatCommandsModal {
	static async show() {
		return await showModal<void>({
			modalId: 'ChatCommands',
			component: defineAsyncComponent(() => import('./AppChatCommandsModal.vue')),
			noEscClose: true,
			noBackdropClose: true,
			size: 'lg',
		});
	}
}
