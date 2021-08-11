import { defineAsyncComponent } from 'vue';
import { Community } from '../../../../../../_common/community/community.model';
import { Modal } from '../../../../../../_common/modal/modal.service';

export class CommunityThumbnailModal {
	static async show(community: Community) {
		return await Modal.show<Community>({
			modalId: 'CommunityThumbnail',
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "CommunityThumbnailModal" */ './modal.vue')
			),
			props: {
				community,
			},
			size: 'sm',
			noBackdropClose: true,
		});
	}
}
