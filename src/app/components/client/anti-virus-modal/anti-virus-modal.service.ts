import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';

export async function showClientAntiVirusModal(message: string, title?: string) {
	return await showModal({
		modalId: 'ClientAntiVirus',
		component: defineAsyncComponent(
			() => import('~app/components/client/anti-virus-modal/AppClientAntiVirusModal.vue')
		),
		props: { message, title },
		size: 'sm',
	});
}
