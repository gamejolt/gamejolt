import { defineAsyncComponent } from 'vue';
import { Community } from '../../../../_common/community/community.model';
import { Modal } from '../../../../_common/modal/modal.service';
import { User } from '../../../../_common/user/user.model';

export class CommunityBlockUserModal {
	static async show(user: User, community: Community) {
		return await Modal.show<boolean>({
			modalId: 'CommunityBlockUser',
			component: defineAsyncComponent(
				() =>
					import(
						/* webpackChunkName: "CommunityBlockUserModal" */ './block-user-modal.vue'
					)
			),
			props: { user, community },
			size: 'lg',
		});
	}
}
