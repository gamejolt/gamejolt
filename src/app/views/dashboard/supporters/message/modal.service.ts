import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../../_common/modal/modal.service';
import { SupporterAction } from '../../../../../_common/supporters/action.model';
import { SupporterMessage } from '../../../../../_common/supporters/message.model';

interface SupporterMessageModalOptions {
	model?: SupporterMessage;
	/**
	 * Provide if sending a custom message to a specific user. If undefined, we
	 * assume that we're editing an existing message template.
	 */
	action?: SupporterAction;
}

export class SupporterMessageModal {
	static async show(options: SupporterMessageModalOptions) {
		const { action, model } = options;

		return await showModal<SupporterMessage>({
			modalId: 'SupporterMessage',
			component: defineAsyncComponent(() => import('./AppSupporterMessageModal.vue')),
			props: {
				action,
				model,
			},
			size: 'sm',
			noBackdropClose: true,
			noEscClose: true,
		});
	}
}
