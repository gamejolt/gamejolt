import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../modal/modal.service';
import { ShareResource } from '../../share.service';

interface ShareModalOptions {
	resource: ShareResource;
	url: string;
}

export async function showShareModal(options: ShareModalOptions) {
	const { resource, url } = options;

	return await showModal<void>({
		modalId: 'Share',
		component: defineAsyncComponent(() => import('./AppShareCardModal.vue')),
		props: {
			resource,
			url,
		},
		size: 'sm',
	});
}
