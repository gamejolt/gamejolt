import { Modal } from '../../../../lib/gj-lib-client/components/modal/modal.service';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export class ClientSystemReportModal {
	static async show() {
		return await Modal.show<void>({
			modalId: 'ClientSystemReport',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "ClientSystemReportModal" */ './system-report-modal')
				),
			size: 'sm',
		});
	}
}
