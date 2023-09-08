import { defineAsyncComponent } from 'vue';
import { showModal } from '../../modal/modal.service';
import { CollectibleModel } from '../collectible.model';

export async function showCollectibleDetailsModal(collectible: CollectibleModel) {
	return await showModal<void>({
		modalId: 'CollectibleDetails',
		component: defineAsyncComponent(() => import('./AppCollectibleDetailsModal.vue')),
		props: { collectible },
		size: 'sm',
	});
}
