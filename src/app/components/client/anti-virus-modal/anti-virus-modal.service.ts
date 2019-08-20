import { Modal } from '../../../../_common/modal/modal.service';
import { asyncComponentLoader } from '../../../../utils/utils';

export class ClientAntiVirusModal {
	static async show(message: string, title?: string) {
		return await Modal.show({
			modalId: 'ClientAntiVirus',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "ClientAntiVirusModal" */ './anti-virus-modal.vue')
				),
			props: { message, title },
			size: 'sm',
		});
	}
}
