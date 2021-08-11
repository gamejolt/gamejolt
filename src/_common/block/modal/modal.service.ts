import { defineAsyncComponent } from 'vue';
import { Modal } from '../../modal/modal.service';
import { User } from '../../user/user.model';

export class BlockModal {
	static async show(user: User) {
		return await Modal.show<boolean>({
			modalId: 'Block',
			size: 'sm',
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "BlockModal" */ './modal.vue')
			),
			props: { user },
		});
	}
}
