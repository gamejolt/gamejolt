import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';
import { SupporterActionModel } from '~common/supporters/action.model';
import { SupporterMessageModel } from '~common/supporters/message.model';

interface DoSupporterMessageModalOptions {
	model?: SupporterMessageModel;
	/**
	 * Provide if sending a custom message to a specific user. If undefined, we
	 * assume that we're editing an existing message template.
	 */
	action?: SupporterActionModel;
}

/**
 * Used to create/edit a thank-you message template, or send an individual
 * thank-you message to a user.
 */

export async function showDoSupporterMessageModal(options: DoSupporterMessageModalOptions) {
	const { action, model } = options;

	return await showModal<SupporterMessageModel>({
		modalId: 'DoSupporterMessage',
		component: defineAsyncComponent(
			() => import('~common/supporters/message/do/FormSupporterMessage.vue')
		),
		props: {
			action,
			model,
		},
		size: 'sm',
		noBackdropClose: true,
		noEscClose: true,
	});
}
