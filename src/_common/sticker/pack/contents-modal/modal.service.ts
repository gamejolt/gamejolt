import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';
import { StickerPackModel } from '~common/sticker/pack/pack.model';

export function showStickerPackContentsModal(pack: StickerPackModel) {
	showModal({
		component: defineAsyncComponent(
			() => import('~common/sticker/pack/contents-modal/AppStickerPackContentsModal.vue')
		),
		modalId: 'StickerPackContents',
		props: { pack },
		size: 'sm',
	});
}
