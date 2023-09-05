import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../modal/modal.service';
import { UserStickerPackModel } from '../user-pack.model';

interface StickerPackOpenModalOptions {
	pack: UserStickerPackModel;
	openImmediate?: boolean;
}

export class StickerPackOpenModal {
	static async show(props: StickerPackOpenModalOptions) {
		return await showModal<void>({
			modalId: 'StickerPackOpen',
			component: defineAsyncComponent(() => import('./AppStickerPackOpenModal.vue')),
			props,
			noBackdrop: true,
			size: 'full',
		});
	}
}
