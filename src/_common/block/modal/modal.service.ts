import { asyncComponentLoader } from '../../../utils/utils';
import { Modal } from '../../modal/modal.service';
import { User } from '../../user/user.model';

export class BlockModal {
	static async show(user: User) {
		return await Modal.show<boolean>({
			modalId: 'Block',
			size: 'sm',
			component: () =>
				asyncComponentLoader(import(/* webpackChunkName: "BlockModal" */ './modal.vue')),
			props: { user },
		});
	}
}
