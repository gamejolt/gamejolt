import { asyncComponentLoader } from '../../../../utils/utils';
import { Modal } from '../../../../_common/modal/modal.service';
import { FiresideController } from '../controller/controller';

const ModalId = 'firesideStreamSetup';

export class StreamSetupModal {
	static async show(c: FiresideController) {
		if (!c.hostRtc) {
			return;
		}

		return await Modal.show<void>({
			modalId: ModalId,
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "FiresideStreamSetup" */ './stream-setup-modal.vue')
				),
			props: {
				c,
			},
			size: 'sm',
			noBackdropClose: true,
			noEscClose: true,
		});
	}

	static close() {
		for (const modal of Modal.findByModalId(ModalId)) {
			modal.dismiss();
		}
	}
}
