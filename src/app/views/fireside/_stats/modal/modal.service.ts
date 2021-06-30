import { asyncComponentLoader } from '../../../../../utils/utils';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import { Modal } from '../../../../../_common/modal/modal.service';
import { RouteStatus } from '../../fireside';

export class FiresideStatsModal {
	static async show(fireside: Fireside, status: RouteStatus) {
		return await Modal.show<void>({
			modalId: 'firesideStats',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "FiresideStatsModal" */ './modal.vue')
				),
			props: {
				fireside,
				status,
			},
			size: 'sm',
		});
	}
}
