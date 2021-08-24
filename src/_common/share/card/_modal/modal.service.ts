import { asyncComponentLoader } from '../../../../utils/utils';
import { Modal } from '../../../modal/modal.service';
import { ShareResource } from '../../share.service';

interface ShareModalOptions {
	resource: ShareResource;
	url: string;
}

export class ShareModal {
	static async show(options: ShareModalOptions) {
		const { resource, url } = options;

		return await Modal.show<void>({
			modalId: 'Share',
			component: () =>
				asyncComponentLoader(import(/* webpackChunkName: "ShareModal" */ './modal.vue')),
			props: {
				resource,
				url,
			},
			size: 'sm',
		});
	}
}
