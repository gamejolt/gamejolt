import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';

export class ClientSystemReportModal {
	static async show() {
		return await showModal<void>({
			modalId: 'ClientSystemReport',
			component: defineAsyncComponent(
				() =>
					import(
						'~app/components/client/system-report-modal/AppClientSystemReportModal.vue'
					)
			),
			size: 'sm',
		});
	}
}
