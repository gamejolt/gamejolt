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
					'~common/inventory/shop/vending-machine/_get-coins-redirect-modal/AppGetCoinsRedirectModal.vue'
				)
		),
		size: 'sm',
	});
}
