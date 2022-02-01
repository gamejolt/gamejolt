import { defineAsyncComponent } from 'vue';
import { showModal } from '../../modal/modal.service';
import { Model } from '../../model/model.service';

export class ReportModal {
	static async show(resource: Model) {
		await showModal({
			modalId: 'Report',
			size: 'sm',
			component: defineAsyncComponent(() => import('./modal.vue')),
			props: { resource },
		});
	}
}
