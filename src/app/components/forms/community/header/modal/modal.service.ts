import { asyncComponentLoader } from '../../../../../../utils/utils';
import { Community } from '../../../../../../_common/community/community.model';
import { Modal } from '../../../../../../_common/modal/modal.service';

export class CommunityHeaderModal {
	static async show(community: Community) {
		return await Modal.show<Community>({
			modalId: 'CommunityHeader',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "CommunityHeaderModal" */ './modal.vue')
				),
			props: {
				community,
			},
			size: 'sm',
		});
	}
}
