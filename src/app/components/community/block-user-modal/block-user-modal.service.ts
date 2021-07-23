import { asyncComponentLoader } from '../../../../utils/utils';
import { Community } from '../../../../_common/community/community.model';
import { Modal } from '../../../../_common/modal/modal.service';
import { User } from '../../../../_common/user/user.model';

type ResultType = {
	ejectPosts: boolean;
};

export class CommunityBlockUserModal {
	static async show(user: User, community: Community) {
		return await Modal.show<ResultType>({
			modalId: 'CommunityBlockUser',
			component: () =>
				asyncComponentLoader(
					import(
						/* webpackChunkName: "CommunityBlockUserModal" */ './block-user-modal.vue'
					)
				),
			props: { user, community },
			size: 'lg',
		});
	}
}
