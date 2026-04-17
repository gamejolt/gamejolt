import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';

/**
 * Returns `true` if the modal is redirecting to a new route.
 */
export async function showGetCoinsRedirectModal() {
	return await showModal<boolean>({
		modalId: 'GetCoinsRedirect',
		component: defineAsyncComponent(
			() =>
				import(
					'~app/components/vending-machine/modal/_get-coins-redirect-modal/AppGetCoinsRedirectModal.vue'
				)
		),
		size: 'sm',
	});
}
