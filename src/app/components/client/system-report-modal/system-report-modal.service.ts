import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { asyncComponentLoader } from 'game-jolt-frontend-lib/utils/utils';

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
