import { asyncComponentLoader } from '../../../../../../utils/utils';
import { Modal } from '../../../../../../_common/modal/modal.service';
import { Sticker } from '../../../../../../_common/sticker/sticker.model';

export class ChatWindowSendStickerModal {
	static async show() {
		return await Modal.show<Sticker>({
			modalId: 'ChatWindowSendSticker',
			component: () =>
				asyncComponentLoader(
					import(
						/* webpackChunkName: "ChatWindowSendStickerModal" */ './sticker-modal.vue'
					)
				),
			size: 'sm',
		});
	}
}
