import { asyncComponentLoader } from '../../../../utils/utils';
import { Modal } from '../../../modal/modal.service';
import { Model } from '../../../model/model.service';

interface ShareModalOptions {
	model: Model;
	url: string;
}

export class ShareModal {
	static async show(options: ShareModalOptions) {
		const { model, url } = options;

		return await Modal.show<void>({
			modalId: 'Share',
			component: () =>
				asyncComponentLoader(import(/* webpackChunkName: "ShareModal" */ './modal.vue')),
			props: {
				model,
				url,
			},
			size: 'sm',
		});
	}
}
