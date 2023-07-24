import { defineAsyncComponent } from 'vue';
import { showModal } from '../../modal/modal.service';
import { ModelStoreModel } from '../../model/model-store.service';
import { Model } from '../../model/model.service';

export class ReportModal {
	static async show(resource: Model | ModelStoreModel) {
		await showModal({
			modalId: 'Report',
			size: 'sm',
			component: defineAsyncComponent(() => import('./modal.vue')),
			props: { resource },
		});
	}
}
