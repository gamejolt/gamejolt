import { defineAsyncComponent } from 'vue';
import { Community } from '../../../../_common/community/community.model';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { showModal } from '../../../../_common/modal/modal.service';

interface FiresideAddModalOptions {
	community?: Community;
}

export class FiresideAddModal {
	static async show(options: FiresideAddModalOptions) {
		const { community } = options;

		return await showModal<Fireside>({
			modalId: 'FiresideAdd',
			component: defineAsyncComponent(() => import('./AppFiresideAddModal.vue')),
			props: {
				community,
			},
			size: 'sm',
		});
	}
}
