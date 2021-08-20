import { asyncComponentLoader } from '../../../../../utils/utils';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import { Modal } from '../../../../../_common/modal/modal.service';
import { RouteStatus } from '../../fireside';
import { FiresideHostRtc } from '../../fireside-host-rtc';

export class FiresideStatsModal {
	static async show(
		fireside: Fireside,
		status: RouteStatus,
		hostRtc: FiresideHostRtc | null,
		isStreaming: boolean
	) {
		return await Modal.show<void>({
			modalId: 'firesideStats',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "FiresideStatsModal" */ './modal.vue')
				),
			props: {
				fireside,
				status,
				hostRtc,
				isStreaming,
			},
			size: 'sm',
		});
	}
}
