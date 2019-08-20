import { Modal } from '../../../../_common/modal/modal.service';
import { asyncComponentLoader } from '../../../../utils/utils';

export class ClientSystemReportModal {
	static async show() {
		return await Modal.show<void>({
			modalId: 'ClientSystemReport',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "ClientSystemReportModal" */ './system-report-modal.vue')
				),
			size: 'sm',
		});
	}
}
