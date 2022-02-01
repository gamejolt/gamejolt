import { defineAsyncComponent } from 'vue';
import { Community } from '../../../../_common/community/community.model';
import { showModal } from '../../../../_common/modal/modal.service';
import { User } from '../../../../_common/user/user.model';

export class CommunityBlockUserModal {
	static async show(user: User, community: Community) {
		return await showModal<boolean>({
			modalId: 'CommunityBlockUser',
			component: defineAsyncComponent(() => import('./block-user-modal.vue')),
			props: { user, community },
			size: 'lg',
		});
	}
}
