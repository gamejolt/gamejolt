import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';
import { UserModel } from '~common/user/user.model';

export async function showBlockModal(user: UserModel) {
	return await showModal<boolean>({
		modalId: 'Block',
		size: 'sm',
		component: defineAsyncComponent(() => import('~common/block/modal/AppReportModal.vue')),
		props: { user },
	});
}
