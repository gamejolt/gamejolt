import { defineAsyncComponent } from 'vue';
import { lazyImportNoSSR } from '../../../../../_common/code-splitting';
import { findModalById, showModal } from '../../../../../_common/modal/modal.service';
import { FiresideController } from '../../controller/controller';

const ModalId = 'firesideStreamSetup';

export class StreamSetupModal {
	static async show(c: FiresideController) {
		if (!c.rtc.value?.producer) {
			return;
		}

		return await showModal<void>({
			modalId: ModalId,
			component: defineAsyncComponent(lazyImportNoSSR(() => import('./setup-modal.vue'))),
			props: {
				c,
			},
			size: 'sm',
			noBackdropClose: true,
			noEscClose: true,
		});
	}

	static close() {
		for (const modal of findModalById(ModalId)) {
			modal.dismiss();
		}
	}
}
