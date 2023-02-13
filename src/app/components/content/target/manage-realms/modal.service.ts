import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../../_common/modal/modal.service';
import { Realm } from '../../../../../_common/realm/realm-model';

interface ContentTargetManageRealmsModalOptions {
	selectedRealms: Realm[];
	maxRealms: number;
}

export class ContentTargetManageRealmsModal {
	static async show(options: ContentTargetManageRealmsModalOptions) {
		const { selectedRealms, maxRealms } = options;

		return await showModal<void>({
			modalId: 'ContentTargetManageRealms',
			component: defineAsyncComponent(
				() => import('./AppContentTargetManageRealmsModal.vue')
			),
			props: {
				selectedRealms,
				maxRealms,
			},
			size: 'sm',
			noBackdropClose: true,
		});
	}
}
