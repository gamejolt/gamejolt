import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../../../../_common/modal/modal.service';
import { StickerModel } from '../../../../../../../_common/sticker/sticker.model';

export async function showFormStickerSelectorModal(props: {
	stickerPackId: number | undefined;
	premium: boolean;
	currentStickers: StickerModel[];
	availableSlots: number;
}) {
	return await showModal<StickerModel[]>({
		modalId: 'FormStickerSelector',
		component: defineAsyncComponent(() => import('./AppFormStickerSelectorModal.vue')),
		props,
	});
}
