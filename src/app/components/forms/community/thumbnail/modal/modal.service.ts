import { defineAsyncComponent } from 'vue';
import { Community } from '../../../../../../_common/community/community.model';
import { showModal } from '../../../../../../_common/modal/modal.service';

export class CommunityThumbnailModal {
	static async show(community: Community) {
		return await showModal<Community>({
			modalId: 'CommunityThumbnail',
			component: defineAsyncComponent(() => import('./modal.vue')),
			props: {
				community,
			},
			size: 'sm',
			noBackdropClose: true,
		});
	}
}
