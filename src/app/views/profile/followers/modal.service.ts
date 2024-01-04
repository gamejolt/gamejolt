import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../_common/modal/modal.service';
import { UserModel } from '../../../../_common/user/user.model';

export async function showProfileFollowersModal({ user }: { user: UserModel }) {
	return await showModal<void>({
		modalId: 'ProfileFollowers',
		component: defineAsyncComponent(() => import('./AppProfileFollowersModal.vue')),
		props: {
			user,
		},
	});
}
