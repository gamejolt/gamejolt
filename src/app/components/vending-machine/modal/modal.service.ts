import { defineAsyncComponent } from 'vue';

import { ShopOpenLocation, trackShopOpen } from '~common/analytics/analytics.service';
import { showModal } from '~common/modal/modal.service';

export async function showVendingMachineModal(options: {
	userId?: number;
	location: ShopOpenLocation;
}) {
	const { userId, location } = options;

	trackShopOpen({ userId, location });

	return await showModal<void>({
		modalId: 'VendingMachine',
		component: defineAsyncComponent(
			() => import('~app/components/vending-machine/modal/AppVendingMachineModal.vue')
		),
		size: 'lg',
		props: {
			userId,
		},
	});
}
