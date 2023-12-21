import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../../_common/modal/modal.service';
import { UserModel } from '../../../../../_common/user/user.model';

export async function showProfileFollowingModal({ user }: { user: UserModel }) {
	return await showModal<void>({
		modalId: 'ProfileFollowing',
		component: defineAsyncComponent(() => import('./AppProfileFollowingModal.vue')),
		props: {
			user,
		},
	});
}
