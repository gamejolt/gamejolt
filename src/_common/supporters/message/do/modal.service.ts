import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../modal/modal.service';
import { SupporterAction } from '../../action.model';
import { SupporterMessage } from '../../message.model';

interface DoSupporterMessageModalOptions {
	model?: SupporterMessage;
	/**
	 * Provide if sending a custom message to a specific user. If undefined, we
	 * assume that we're editing an existing message template.
	 */
	action?: SupporterAction;
}

/**
 * Used to create/edit a thank-you message template, or send an individual
 * thank-you message to a user.
 */
export class DoSupporterMessageModal {
	static async show(options: DoSupporterMessageModalOptions) {
		const { action, model } = options;

		return await showModal<SupporterMessage>({
			modalId: 'DoSupporterMessage',
			component: defineAsyncComponent(() => import('./FormSupporterMessage.vue')),
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
