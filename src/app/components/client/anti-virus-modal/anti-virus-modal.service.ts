import { Modal } from '../../../../lib/gj-lib-client/components/modal/modal.service';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export class ClientAntiVirusModal {
	static async show(message: string, title?: string) {
		return await Modal.show({
			modalId: 'ClientAntiVirus',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "ClientAntiVirusModal" */ './anti-virus-modal')
				),
			props: { message, title },
			size: 'sm',
		});
	}
}
