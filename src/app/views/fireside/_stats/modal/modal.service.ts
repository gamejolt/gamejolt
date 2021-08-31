import { asyncComponentLoader } from '../../../../../utils/utils';
import { Modal } from '../../../../../_common/modal/modal.service';
import { FiresideController } from '../../controller/controller';

export class FiresideStatsModal {
	static async show(controller: FiresideController) {
		return await Modal.show<void>({
			modalId: 'firesideStats',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "FiresideStatsModal" */ './modal.vue')
				),
			props: {
				controller,
			},
			size: 'sm',
		});
	}
}
