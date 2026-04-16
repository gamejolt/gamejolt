import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';
import { SupporterActionModel } from '~common/supporters/action.model';
import { SupporterMessageModel } from '~common/supporters/message.model';

/**
 * Used to display a thank-you message from a creator.
 */

export async function showSupporterMessageModal(action: SupporterActionModel) {
	return await showModal<SupporterMessageModel>({
		modalId: 'SupporterMessage',
		component: defineAsyncComponent(() => import('~common/supporters/message/AppSupporterMessageModal.vue')),
		props: {
			action,
		},
		size: 'sm',
	});
}
