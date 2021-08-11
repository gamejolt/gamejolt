import { defineAsyncComponent } from 'vue';
import { Modal } from '../../modal/modal.service';
import { Model } from '../../model/model.service';

export class ReportModal {
	static async show(resource: Model) {
		await Modal.show({
			modalId: 'Report',
			size: 'sm',
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "ReportModal" */ './modal.vue')
			),
			props: { resource },
		});
	}
}
