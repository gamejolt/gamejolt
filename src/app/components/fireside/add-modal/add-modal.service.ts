import { defineAsyncComponent } from 'vue';
import { CommunityModel } from '../../../../_common/community/community.model';
import { FiresideModel } from '../../../../_common/fireside/fireside.model';
import { showModal } from '../../../../_common/modal/modal.service';
import { RealmModel } from '../../../../_common/realm/realm-model';

interface FiresideAddModalOptions {
	community?: CommunityModel;
	realms?: RealmModel[];
}

export class FiresideAddModal {
	static async show(options: FiresideAddModalOptions) {
		const { community, realms } = options;

		return await showModal<FiresideModel>({
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
