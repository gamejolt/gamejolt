import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../../_common/modal/modal.service';
import { Realm } from '../../../../../_common/realm/realm-model';

interface PostTargetManageRealmsModalOptions {
	selectedRealms: Realm[];
	maxRealms: number;
}

export class PostTargetManageRealmsModal {
	static async show(options: PostTargetManageRealmsModalOptions) {
		const { selectedRealms, maxRealms } = options;

		return await showModal<void>({
			modalId: 'PostTargetManageRealms',
			component: defineAsyncComponent(() => import('./AppPostTargetManageRealmsModal.vue')),
			props: {
				selectedRealms,
				maxRealms,
			},
			size: 'sm',
			noBackdropClose: true,
		});
	}
}
