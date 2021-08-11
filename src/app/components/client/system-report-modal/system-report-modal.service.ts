import { defineAsyncComponent } from 'vue';
import { Modal } from '../../../../_common/modal/modal.service';

export class ClientSystemReportModal {
	static async show() {
		return await Modal.show<void>({
			modalId: 'ClientSystemReport',
			component: defineAsyncComponent(
				() =>
					import(
						/* webpackChunkName: "ClientSystemReportModal" */ './system-report-modal.vue'
					)
			),
			size: 'sm',
		});
	}
}
