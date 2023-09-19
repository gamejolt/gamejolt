import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../../_common/modal/modal.service';
import { ShopManagerStore } from '../RouteDashShop.vue';

export type ShopChangesType = keyof ShopManagerStore['changes'];

export async function showManageShopChangesModal({
	controller,
	manageType,
}: {
	controller: ShopManagerStore;
	manageType: ShopChangesType;
}) {
	return await showModal<void>({
		modalId: 'ManageShopChanges',
		component: defineAsyncComponent(() => import('./AppManageShopChangesModal.vue')),
		props: {
			controller,
			manageType,
		},
	});
}
