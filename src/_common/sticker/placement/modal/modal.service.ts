import { asyncComponentLoader } from '../../../../utils/utils';
import { Modal } from '../../../modal/modal.service';
import { Model } from '../../../model/model.service';
import { Sticker } from '../../sticker.model';

export class StickerPlacementModal {
	static async show(model: Model, sticker: Sticker) {
		return await Modal.show<void>({
			modalId: 'StickerPlacement',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "StickerPlacementModal" */ './modal.vue')
				),
			size: 'sm',
			props: {
				model,
				sticker,
			},
			// We don't want the modal to close by backdrop click, because the user could accidentally close it while dragging the sticker around.
			noBackdropClose: true,
		});
	}
}
