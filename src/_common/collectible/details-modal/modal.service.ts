import { defineAsyncComponent } from 'vue';
import { JoltydexFeed } from '../../joltydex/joltydex-feed';
import { showModal } from '../../modal/modal.service';
import { CollectibleModel } from '../collectible.model';

export async function showCollectibleDetailsModal({
	collectible,
	feed,
}: {
	collectible: CollectibleModel;
	feed: JoltydexFeed;
}) {
	return await showModal<void>({
		modalId: 'CollectibleDetails',
		component: defineAsyncComponent(() => import('./AppCollectibleDetailsModal.vue')),
		props: {
			collectible,
			feed,
		},
		size: 'sm',
	});
}
