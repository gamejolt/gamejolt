import { defineAsyncComponent } from 'vue';
import { showModal } from '../../modal/modal.service';
import { User } from '../../user/user.model';

export class StickerSupportersModal {
	static async show(supporters: User[]) {
		return await showModal({
			modalId: 'StickerSupporters',
			component: defineAsyncComponent(() => import('./AppStickerSupportersModal.vue')),
			props: { supporters },
			size: 'sm',
		});
	}
}
