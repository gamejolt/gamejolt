import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';

export async function showModalConfirm(
	message: string,
	title = 'Confirm...',
	buttonType: 'ok' | 'yes' = 'yes'
) {
	return await showModal<boolean>({
		modalId: 'Confirm',
		size: 'sm',
		component: defineAsyncComponent(() => import('~common/modal/confirm/AppModalConfirm.vue')),
		props: { message, title, buttonType },
	});
}
