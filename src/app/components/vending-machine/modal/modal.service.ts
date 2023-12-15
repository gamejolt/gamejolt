import { defineAsyncComponent } from 'vue';
import { ShopOpenLocation, trackShopOpen } from '../../../../_common/analytics/analytics.service';
import { showModal } from '../../../../_common/modal/modal.service';

export async function showVendingMachineModal(options: {
	userId?: number;
	location: ShopOpenLocation;
}) {
	const { userId, location } = options;

	trackShopOpen({ userId, location });

	return await showModal<void>({
		modalId: 'VendingMachine',
		component: defineAsyncComponent(() => import('./AppVendingMachineModal.vue')),
		size: 'lg',
		props: {
			userId,
		},
	});
}
