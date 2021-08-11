import { Location } from 'vue-router';
import { asyncComponentLoader } from '../../../../utils/utils';
import { Modal } from '../../../modal/modal.service';
import { Model } from '../../../model/model.service';

interface ShareModalOptions {
	model: Model;
	location: Location;
}

export class ShareModal {
	static async show(options: ShareModalOptions) {
		const { model, location } = options;

		return await Modal.show<void>({
			modalId: 'Share',
			component: () =>
				asyncComponentLoader(import(/* webpackChunkName: "ShareModal" */ './modal.vue')),
			props: {
				model,
				location,
			},
			size: 'sm',
		});
	}
}
