import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';
import { UserModel } from '~common/user/user.model';

export async function showProfileFollowersModal({ user }: { user: UserModel }) {
	return await showModal<void>({
		modalId: 'ProfileFollowers',
		component: defineAsyncComponent(() => import('~app/views/profile/followers/AppProfileFollowersModal.vue')),
		props: {
			user,
		},
	});
}
