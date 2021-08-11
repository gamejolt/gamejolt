import { asyncComponentLoader } from '../../../../utils/utils';
import { Modal } from '../../../modal/modal.service';
import { Model } from '../../../model/model.service';

interface ShareModalOptions {
	url: string;
	model?: Model;
}

export class ShareModal {
	static async show(options: ShareModalOptions) {
		const { url, model } = options;

		return await Modal.show<void>({
			modalId: 'Share',
			component: () =>
				asyncComponentLoader(import(/* webpackChunkName: "ShareModal" */ './modal.vue')),
			props: {
				url,
				model,
			},
			size: 'sm',
		});
	}
}
