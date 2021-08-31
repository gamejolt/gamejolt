import { asyncComponentLoader } from '../../../../utils/utils';
import { Modal } from '../../../../_common/modal/modal.service';
import { FiresideRTCProducer } from '../../../../_common/fireside/rtc/producer';

const ModalId = 'firesideStreamSetup';

export class StreamSetupModal {
	static async show(firesideHostRtc: FiresideRTCProducer) {
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
