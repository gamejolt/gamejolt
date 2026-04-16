import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';
import { ShareResource } from '~common/share/share.service';

interface ShareModalOptions {
	resource: ShareResource;
	url: string;
}

export async function showShareModal(options: ShareModalOptions) {
	const { resource, url } = options;

	return await showModal<void>({
		modalId: 'Share',
		component: defineAsyncComponent(() => import('~common/share/card/_modal/AppShareCardModal.vue')),
		props: {
			resource,
			url,
		},
		size: 'sm',
	});
}
