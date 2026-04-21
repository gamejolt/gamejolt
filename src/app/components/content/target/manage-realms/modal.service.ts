import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';
import { RealmModel } from '~common/realm/realm-model';

interface ContentTargetManageRealmsModalOptions {
	selectedRealms: RealmModel[];
	maxRealms: number;
}

export async function showContentTargetManageRealmsModal(
	options: ContentTargetManageRealmsModalOptions
) {
	const { selectedRealms, maxRealms } = options;

	return await showModal<RealmModel[]>({
		modalId: 'ContentTargetManageRealms',
		component: defineAsyncComponent(
			() =>
				import('~app/components/content/target/manage-realms/AppContentTargetManageRealmsModal.vue')
		),
		props: {
			selectedRealms,
			maxRealms,
		},
		size: 'sm',
		noBackdropClose: true,
	});
}
