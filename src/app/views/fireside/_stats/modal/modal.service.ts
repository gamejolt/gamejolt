import { asyncComponentLoader } from '../../../../../utils/utils';
import { Modal } from '../../../../../_common/modal/modal.service';
import { RouteStatus } from '../../fireside';
import { FiresideController } from '../../_controller/controller';

export class FiresideStatsModal {
	static async show(controller: FiresideController, status: RouteStatus, isStreaming: boolean) {
		return await Modal.show<void>({
			modalId: 'firesideStats',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "FiresideStatsModal" */ './modal.vue')
				),
			props: {
				controller,
				status,
				isStreaming,
			},
			size: 'sm',
		});
	}
}
