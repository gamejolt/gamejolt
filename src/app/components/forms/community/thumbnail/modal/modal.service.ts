import { defineAsyncComponent } from 'vue';
import { CommunityModel } from '../../../../../../_common/community/community.model';
import { showModal } from '../../../../../../_common/modal/modal.service';

export class CommunityThumbnailModal {
	static async show(community: CommunityModel) {
		return await showModal<CommunityModel>({
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
