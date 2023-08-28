import { defineAsyncComponent } from 'vue';
import { showModal } from '../../modal/modal.service';
import { UserModel } from '../../user/user.model';

export class BlockModal {
	static async show(user: UserModel) {
		return await showModal<boolean>({
			modalId: 'Block',
			size: 'sm',
			component: defineAsyncComponent(() => import('./modal.vue')),
			props: { user },
		});
	}
}
