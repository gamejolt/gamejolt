import { defineAsyncComponent } from 'vue';
import { lazyImportNoSSR } from '../../../../../_common/code-splitting';
import { getDeviceOS } from '../../../../../_common/device/device.service';
import { findModalById, showModal } from '../../../../../_common/modal/modal.service';
import { FiresideController } from '../../controller/controller';

const ModalId = 'firesideStreamSetup';

/**
 * Should we show the app promo, because it will be better on their device?
 */
export const shouldPromoteAppForStreaming = !GJ_IS_DESKTOP_APP && getDeviceOS() === 'windows';

export class StreamSetupModal {
	static async show(c: FiresideController) {
		if (!c.rtc.value?.producer) {
			return;
		}

		return await showModal<void>({
			modalId: ModalId,
			component: defineAsyncComponent(
				lazyImportNoSSR(() => import('./AppFiresideStreamSetupModal.vue'))
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
		for (const modal of findModalById(ModalId)) {
			modal.dismiss();
		}
	}
}
