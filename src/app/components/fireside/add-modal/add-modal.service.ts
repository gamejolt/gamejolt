import { defineAsyncComponent } from 'vue';
import { Community } from '../../../../_common/community/community.model';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { showModal } from '../../../../_common/modal/modal.service';
import { Realm } from '../../../../_common/realm/realm-model';

interface FiresideAddModalOptions {
	community?: Community;
	realms?: Realm[];
}

export class FiresideAddModal {
	static async show(options: FiresideAddModalOptions) {
		const { community, realms } = options;

		return await showModal<Fireside>({
			modalId: 'FiresideAdd',
			component: defineAsyncComponent(() => import('./AppFiresideAddModal.vue')),
			props: {
				community,
				realms,
			},
			size: 'sm',
		});
	}
}
