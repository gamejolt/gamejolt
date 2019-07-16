import { Community } from 'game-jolt-frontend-lib/components/community/community.model';
import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { asyncComponentLoader } from 'game-jolt-frontend-lib/utils/utils';

export class CommunityThumbnailModal {
	static async show(community: Community) {
		return await Modal.show<Community>({
			modalId: 'CommunityThumbnail',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "CommunityThumbnailModal" */ './modal.vue')
				),
			props: {
				community,
			},
			size: 'sm',
		});
	}
}
