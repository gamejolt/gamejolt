import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../../../_common/modal/modal.service';

export class ChatCommandsModal {
	static async show() {
		return await showModal<void>({
			modalId: 'ChatCommands',
			component: defineAsyncComponent(() => import('./ChatCommandsModal.vue')),
			noEscClose: true,
			noBackdropClose: true,
			size: 'lg',
		});
	}
}
