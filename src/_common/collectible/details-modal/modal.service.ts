import { defineAsyncComponent } from 'vue';

import { CollectibleModel } from '~common/collectible/collectible.model';
import { JoltydexFeed } from '~common/joltydex/joltydex-feed';
import { showModal } from '~common/modal/modal.service';

export async function showCollectibleDetailsModal({
	collectible,
	feed,
}: {
	collectible: CollectibleModel;
	feed: JoltydexFeed;
}) {
	return await showModal<void>({
		modalId: 'CollectibleDetails',
		component: defineAsyncComponent(() => import('~common/collectible/details-modal/AppCollectibleDetailsModal.vue')),
		props: {
			collectible,
			feed,
		},
		size: 'sm',
	});
}
