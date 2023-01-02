import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../../_common/modal/modal.service';
import { SupporterAction } from '../../../../../_common/supporters/action.model';
import { SupporterMessage } from '../../../../../_common/supporters/message.model';

/**
 * Used to display a thank-you message from a creator.
 */
export class SupporterMessageModal {
	static async show(action: SupporterAction) {
		return await showModal<SupporterMessage>({
			modalId: 'SupporterMessage',
			component: defineAsyncComponent(() => import('./AppSupporterMessageModal.vue')),
			props: {
				action,
			},
			size: 'sm',
		});
	}
}
