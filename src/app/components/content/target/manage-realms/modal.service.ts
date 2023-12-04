import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../../_common/modal/modal.service';
import { RealmModel } from '../../../../../_common/realm/realm-model';

interface ContentTargetManageRealmsModalOptions {
	selectedRealms: RealmModel[];
	maxRealms: number;
}

export async function showContentTargetManageRealmsModal(
	options: ContentTargetManageRealmsModalOptions
) {
	const { selectedRealms, maxRealms } = options;

	return await showModal<void>({
		modalId: 'ContentTargetManageRealms',
		component: defineAsyncComponent(() => import('./AppContentTargetManageRealmsModal.vue')),
		props: {
			selectedRealms,
			maxRealms,
		},
		size: 'sm',
		noBackdropClose: true,
	});
}
