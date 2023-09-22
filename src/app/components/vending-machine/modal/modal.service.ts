import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../_common/modal/modal.service';

interface OptionsWithUser {
	userId: number;
	shopId?: never;
}

interface OptionsWithShop {
	shopId: number;
	userId?: never;
}

export async function showVendingMachineModal(options?: OptionsWithUser | OptionsWithShop) {
	const { userId, shopId } = options || {};

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
