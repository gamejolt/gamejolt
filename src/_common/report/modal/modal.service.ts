import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';
import { Model } from '~common/model/model.service';
import { ModelStoreModel } from '~common/model/model-store.service';

export async function showReportModal(resource: Model | ModelStoreModel) {
	await showModal({
		modalId: 'Report',
		size: 'sm',
		component: defineAsyncComponent(() => import('~common/report/modal/AppReportModal.vue')),
		props: { resource },
	});
}
