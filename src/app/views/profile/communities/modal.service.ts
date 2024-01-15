import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../_common/modal/modal.service';
import { UserModel } from '../../../../_common/user/user.model';

export async function showProfileCommunitiesModal({ user }: { user: UserModel }) {
	return await showModal<void>({
		modalId: 'ProfileCommunities',
		component: defineAsyncComponent(() => import('./AppProfileCommunitiesModal.vue')),
		props: {
			user,
		},
		size: 'sm',
	});
}
