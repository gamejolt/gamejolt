import { defineAsyncComponent } from 'vue';
import { showModal } from '../../modal/modal.service';
import { SupporterActionModel } from '../action.model';
import { SupporterMessageModel } from '../message.model';

/**
 * Used to display a thank-you message from a creator.
 */

export async function showSupporterMessageModal(action: SupporterActionModel) {
	return await showModal<SupporterMessageModel>({
		modalId: 'SupporterMessage',
		component: defineAsyncComponent(() => import('./AppSupporterMessageModal.vue')),
		props: {
			action,
		},
		size: 'sm',
	});
}
