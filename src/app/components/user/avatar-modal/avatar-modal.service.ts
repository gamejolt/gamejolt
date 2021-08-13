import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../_common/modal/modal.service';

export class UserAvatarModal {
	static async show() {
		return await showModal<void>({
			modalId: 'UserAvatar',
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "UserAvatarModal" */ './avatar-modal.vue')
			),
			size: 'sm',
			noBackdropClose: true,
		});
	}
}
