import { asyncComponentLoader } from '../../../utils/utils';
import { Modal } from '../../modal/modal.service';
import { Model } from '../../model/model.service';
import { Sticker } from '../sticker.model';

export class StickerSelectModal {
	static async show(model: Model) {
		return await Modal.show<Sticker>({
			modalId: 'SelectSticker',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "StickerSelectModal" */ './select-modal.vue')
				),
			size: 'sm',
			props: {
				model,
			},
		});
	}
}
