import { defineAsyncComponent } from 'vue';
import { showModal } from '../../modal/modal.service';
import { UserModel } from '../../user/user.model';

export async function showBlockModal(user: UserModel) {
	return await showModal<boolean>({
		modalId: 'Block',
		size: 'sm',
		component: defineAsyncComponent(() => import('./AppReportModal.vue')),
		props: { user },
	});
}
