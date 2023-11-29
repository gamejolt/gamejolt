import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../../_common/modal/modal.service';

export type PurchasableProductData = {
	resource: 'Avatar_Frame' | 'Background' | 'Sticker_Pack';
	resourceId: number;
};

/**
 * Shows a modal that allows the user to purchase a product or gives some info
 * on how to obtain it.
 */
export async function showPurchaseShopProductModal({
	resource,
	resourceId,
	onItemPurchased,
}: {
	resource: PurchasableProductData['resource'];
	resourceId: PurchasableProductData['resourceId'];

	onItemPurchased?(): void;
}) {
	return await showModal<void>({
		modalId: 'PurchaseShopProduct',
		component: defineAsyncComponent(() => import('./AppPurchaseShopProductModal.vue')),
		props: {
			initialProductData: {
				resource,
				resourceId,
			},
			onItemPurchased,
		},
		size: 'sm',
	});
}
