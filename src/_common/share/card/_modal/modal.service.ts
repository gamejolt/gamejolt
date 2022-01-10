import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../modal/modal.service';
import { ShareResource } from '../../share.service';

interface ShareModalOptions {
	resource: ShareResource;
	url: string;
}

export class ShareModal {
	static async show(options: ShareModalOptions) {
		const { resource, url } = options;

		return await showModal<void>({
			modalId: 'Share',
			component: defineAsyncComponent(() => import('./modal.vue')),
			props: {
				resource,
				url,
			},
			size: 'sm',
		});
	}
}
