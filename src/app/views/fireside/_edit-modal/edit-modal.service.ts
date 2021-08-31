import { asyncComponentLoader } from '../../../../utils/utils';
import { Modal } from '../../../../_common/modal/modal.service';
import { FiresideController } from '../controller/controller';

export class FiresideEditModal {
	static async show(controller: FiresideController) {
		return await Modal.show<void>({
			modalId: 'firesideEdit',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "FiresideEditModal" */ './edit-modal.vue')
				),
			props: {
				controller,
			},
			size: 'sm',
		});
	}
}
