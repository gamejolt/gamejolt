import { defineAsyncComponent } from 'vue';
import { Modal } from '../../../../_common/modal/modal.service';

export class ClientAntiVirusModal {
	static async show(message: string, title?: string) {
		return await Modal.show({
			modalId: 'ClientAntiVirus',
			component: defineAsyncComponent(
				() =>
					import(/* webpackChunkName: "ClientAntiVirusModal" */ './anti-virus-modal.vue')
			),
			props: { message, title },
			size: 'sm',
		});
	}
}
