import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { asyncComponentLoader } from 'game-jolt-frontend-lib/utils/utils';

export class CommunityHeaderModal {
	static async show(community: Community) {
		return await Modal.show<Community>({
			modalId: 'CommunityHeader',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "CommunityHeaderModal" */ './header-modal')
				),
			props: {
				community,
			},
			size: 'sm',
		});
	}
}
