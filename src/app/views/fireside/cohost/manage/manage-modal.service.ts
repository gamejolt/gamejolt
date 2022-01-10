import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../../_common/modal/modal.service';
import { FiresideController } from '../../../../components/fireside/controller/controller';

export class CohostManageModal {
	static async show(controller: FiresideController) {
		return await showModal({
			modalId: 'CohostManage',
			size: 'sm',
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "CohostManageModal" */ './manage-modal.vue')
			),
			props: { controller },
		});
	}
}
