import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';
import { UserStickerPackModel } from '~common/sticker/pack/user-pack.model';

interface StickerPackOpenModalOptions {
	pack: UserStickerPackModel;
	openImmediate?: boolean;
}

export async function showStickerPackOpenModal(props: StickerPackOpenModalOptions) {
	return await showModal<void>({
		modalId: 'StickerPackOpen',
		component: defineAsyncComponent(
			() => import('~common/sticker/pack/open-modal/AppStickerPackOpenModal.vue')
		),
		props,
		noBackdrop: true,
		size: 'full',
	});
}
