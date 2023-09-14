import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../../../_common/modal/modal.service';
import { FiresideController } from '../../../../fireside/controller/controller';

interface FiresideHostsModalOptions {
	controller: FiresideController;
}

export async function showFiresideHostsModal(options: FiresideHostsModalOptions) {
	const { controller } = options;

	return await showModal<void>({
		modalId: 'FiresideHosts',
		component: defineAsyncComponent(() => import('./AppFiresideHostsModal.vue')),
		props: {
			controller,
		},
		size: 'sm',
	});
}
