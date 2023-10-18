import { defineAsyncComponent } from 'vue';
import { CommunityModel } from '../../../../_common/community/community.model';
import { showModal } from '../../../../_common/modal/modal.service';
import { UserModel } from '../../../../_common/user/user.model';

export async function showCommunityBlockUserModal(user: UserModel, community: CommunityModel) {
	return await showModal<boolean>({
		modalId: 'CommunityBlockUser',
		component: defineAsyncComponent(() => import('./AppCommunityBlocKUserModal.vue')),
		props: { user, community },
		size: 'lg',
	});
}
