import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';
import { UserModel } from '~common/user/user.model';

export async function showProfileFollowingModal({ user }: { user: UserModel }) {
	return await showModal<void>({
		modalId: 'ProfileFollowing',
		component: defineAsyncComponent(
			() => import('~app/views/profile/following/AppProfileFollowingModal.vue')
		),
		props: {
			user,
		},
	});
}
