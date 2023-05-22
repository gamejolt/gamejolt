import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../../_common/modal/modal.service';

/**
 * Returns `true` if the modal is redirecting to a new route.
 */
export async function showGetCoinsRedirectModal() {
	return await showModal<boolean>({
		modalId: 'GetCoinsRedirect',
		component: defineAsyncComponent(() => import('./AppGetCoinsRedirectModal.vue')),
		size: 'sm',
	});
}
