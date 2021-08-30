import { asyncComponentLoader } from '../../../../utils/utils';
import { Modal } from '../../../../_common/modal/modal.service';
import { FiresideHostRTC } from '../fireside-host-rtc';

const ModalId = 'firesideStreamSetup';

export class StreamSetupModal {
	static async show(firesideHostRtc: FiresideHostRTC) {
		return await Modal.show<void>({
			modalId: ModalId,
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "FiresideStreamSetup" */ './stream-setup-modal.vue')
				),
			props: {
				firesideHostRtc,
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
