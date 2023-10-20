import { defineAsyncComponent } from 'vue';
import { CommunityModel } from '../../../../../../_common/community/community.model';
import { showModal } from '../../../../../../_common/modal/modal.service';

export async function showCommunityHeaderModal(community: CommunityModel) {
	return await showModal<CommunityModel>({
		modalId: 'CommunityHeader',
		component: defineAsyncComponent(() => import('./modal.vue')),
		props: {
			community,
		},
		size: 'sm',
		noBackdropClose: true,
	});
}
