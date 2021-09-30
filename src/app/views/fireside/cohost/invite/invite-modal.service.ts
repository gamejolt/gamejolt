import { asyncComponentLoader } from '../../../../../utils/utils';
import { Modal } from '../../../../../_common/modal/modal.service';
import { FiresideController } from '../../../../components/fireside/controller/controller';

export class CohostInviteModal {
	static async show(controller: FiresideController) {
		return await Modal.show({
			modalId: 'CohostInvite',
			size: 'sm',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "CohostInviteModal" */ './invite-modal.vue')
				),
			props: { controller },
		});
	}
}
