import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../modal/modal.service';

export class StickerChargeModal {
	static async show() {
		return await showModal({
			modalId: 'StickerCharge',
			component: defineAsyncComponent(() => import('./AppStickerChargeModal.vue')),
			size: 'sm',
		});
	}
}
