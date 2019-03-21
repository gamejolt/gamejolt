import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { asyncComponentLoader } from 'game-jolt-frontend-lib/utils/utils';

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
