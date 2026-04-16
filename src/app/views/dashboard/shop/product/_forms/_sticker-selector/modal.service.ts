import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';
import { StickerModel } from '~common/sticker/sticker.model';

export async function showFormStickerSelectorModal(props: {
	stickerPackId: number | undefined;
	premium: boolean;
	currentStickers: StickerModel[];
	availableSlots: number;
}) {
	return await showModal<StickerModel[]>({
		modalId: 'FormStickerSelector',
		component: defineAsyncComponent(() => import('~app/views/dashboard/shop/product/_forms/_sticker-selector/AppFormStickerSelectorModal.vue')),
		props,
	});
}
