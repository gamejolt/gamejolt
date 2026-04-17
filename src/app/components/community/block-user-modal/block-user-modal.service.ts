import { defineAsyncComponent } from 'vue';

import { CommunityModel } from '~common/community/community.model';
import { showModal } from '~common/modal/modal.service';
import { UserModel } from '~common/user/user.model';

export async function showCommunityBlockUserModal(user: UserModel, community: CommunityModel) {
	return await showModal<boolean>({
		modalId: 'CommunityBlockUser',
		component: defineAsyncComponent(
			() =>
				import('~app/components/community/block-user-modal/AppCommunityBlockUserModal.vue')
		),
		props: { user, community },
		size: 'lg',
	});
}
