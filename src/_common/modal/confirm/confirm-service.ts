import { defineAsyncComponent } from 'vue';
import { showModal } from '../modal.service';

export async function showModalConfirm(
	message: string,
	title = 'Confirm...',
	buttonType: 'ok' | 'yes' = 'yes'
) {
	return await showModal<boolean>({
		modalId: 'Confirm',
		size: 'sm',
		component: defineAsyncComponent(() => import('./AppModalConfirm.vue')),
		props: { message, title, buttonType },
	});
}
