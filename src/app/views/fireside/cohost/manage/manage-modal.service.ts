import { asyncComponentLoader } from '../../../../../utils/utils';
import { Modal } from '../../../../../_common/modal/modal.service';
import { FiresideController } from '../../../../components/fireside/controller/controller';

export class CohostManageModal {
	static async show(controller: FiresideController) {
		return await Modal.show({
			modalId: 'CohostManage',
			size: 'sm',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "CohostManageModal" */ './manage-modal.vue')
				),
			props: { controller },
		});
	}
}
