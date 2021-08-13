import { defineAsyncComponent } from 'vue';
import { showModal } from '../../modal/modal.service';
import { User } from '../../user/user.model';

export class BlockModal {
	static async show(user: User) {
		return await showModal<boolean>({
			modalId: 'Block',
			size: 'sm',
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "BlockModal" */ './modal.vue')
			),
			props: { user },
		});
	}
}
