import { asyncComponentLoader } from '../../../../../utils/utils';
import { Modal } from '../../../../../_common/modal/modal.service';
import { FiresideController } from '../../../../components/fireside/controller/controller';

export class CohostRemoveModal {
	static async show(controller: FiresideController) {
		return await Modal.show({
			modalId: 'CohostRemove',
			size: 'sm',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "CohostRemoveModal" */ './remove-modal.vue')
				),
			props: { controller },
		});
	}
}
