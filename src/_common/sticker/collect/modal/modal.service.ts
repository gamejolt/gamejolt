import { asyncComponentLoader } from '../../../../utils/utils';
import { Modal } from '../../../modal/modal.service';

export class StickerCollectModal {
	static async show() {
		return await Modal.show({
			modalId: 'StickerCollect',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "StickerCollectModal" */ './modal.vue')
				),
			size: 'full',
		});
	}
}
