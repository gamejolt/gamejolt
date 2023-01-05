import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../../_common/modal/modal.service';
import { StickerPack } from '../../../../../_common/sticker/pack/pack.model';

export type VendingMachinePurchaseResult = 'purchase' | 'purchase-and-open';

interface VendingMachinePurchaseOptions {
	pack: StickerPack;
}

export async function showVendingMachinePurchaseModal(options: VendingMachinePurchaseOptions) {
	const { pack } = options;

	return await showModal<VendingMachinePurchaseResult>({
		modalId: 'VendingMachinePurchase',
		component: defineAsyncComponent(() => import('./AppVendingMachinePurchaseModal.vue')),
		props: {
			pack,
		},
		size: 'sm',
	});
}
