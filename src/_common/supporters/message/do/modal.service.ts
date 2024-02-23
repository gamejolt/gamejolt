import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../modal/modal.service';
import { SupporterActionModel } from '../../action.model';
import { SupporterMessageModel } from '../../message.model';

interface DoSupporterMessageModalOptions {
	model?: SupporterMessageModel;
	/**
	 * Provide if sending a custom message to a specific user. If undefined, we
	 * assume that we're editing an existing message template.
	 */
	action?: SupporterActionModel;
}

interface SupporterMessageModalResponse {
	message: SupporterMessageModel;
	canSendAll?: boolean;
}

/**
 * Used to create/edit a thank-you message template, or send an individual
 * thank-you message to a user.
 */

export async function showDoSupporterMessageModal(options: DoSupporterMessageModalOptions) {
	const { action, model } = options;

	return await showModal<SupporterMessageModalResponse>({
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
