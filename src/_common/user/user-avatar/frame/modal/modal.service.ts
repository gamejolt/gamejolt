import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../modal/modal.service';

// TODO(avatar-frames) use or remove
export class UserAvatarFrameModal {
	static async show() {
		return await showModal<void>({
			modalId: 'UserAvatarFrame',
			component: defineAsyncComponent(() => import('./AppUserAvatarFrameModal.vue')),
			size: 'sm',
		});
	}
}
