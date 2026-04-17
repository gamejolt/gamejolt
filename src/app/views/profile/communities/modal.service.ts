import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';
import { UserModel } from '~common/user/user.model';

export async function showProfileCommunitiesModal({ user }: { user: UserModel }) {
	return await showModal<void>({
		modalId: 'ProfileCommunities',
		component: defineAsyncComponent(
			() => import('~app/views/profile/communities/AppProfileCommunitiesModal.vue')
		),
		props: {
			user,
		},
		size: 'sm',
	});
}
