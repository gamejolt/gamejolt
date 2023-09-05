import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../modal/modal.service';
import { StickerPackModel } from '../pack.model';

export function showStickerPackContentsModal(pack: StickerPackModel) {
	showModal({
		component: defineAsyncComponent(() => import('./AppStickerPackContentsModal.vue')),
		modalId: 'StickerPackContents',
		props: { pack },
		size: 'sm',
	});
}
