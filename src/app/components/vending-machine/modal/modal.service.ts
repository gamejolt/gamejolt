import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../_common/modal/modal.service';

export async function showVendingMachineModal(options: { userId?: number; shopId?: number } = {}) {
	const userId = options.userId;
	// User id takes precedence over shop id.
	const shopId = userId ? undefined : options.shopId;

	return await showModal<void>({
		modalId: 'VendingMachine',
		component: defineAsyncComponent(() => import('./AppVendingMachineModal.vue')),
		size: 'lg',
		props: {
			userId,
			shopId,
		},
	});
}
