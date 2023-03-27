import { defineAsyncComponent } from 'vue';
import { showModal } from '../../modal/modal.service';
import { InventoryCollectible } from '../collectible.model';

interface CollectibleDetailsModalOptions {
	collectible: InventoryCollectible;
}

export class CollectibleDetailsModal {
	static async show(options: CollectibleDetailsModalOptions) {
		const { collectible } = options;

		return await showModal({
			modalId: 'CollectibleDetails',
			component: defineAsyncComponent(() => import('./AppCollectibleDetailsModal.vue')),
			props: { collectible },
			size: 'sm',
		});
	}
}
