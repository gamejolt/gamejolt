import { defineAsyncComponent } from 'vue';

import { CommunityModel } from '~common/community/community.model';
import { showModal } from '~common/modal/modal.service';

export async function showCommunityThumbnailModal(community: CommunityModel) {
	return await showModal<CommunityModel>({
		modalId: 'CommunityThumbnail',
		component: defineAsyncComponent(
			() =>
				import('~app/components/forms/community/thumbnail/modal/FormCommunityThumbnailModal.vue')
		),
		props: {
			community,
		},
		size: 'sm',
		noBackdropClose: true,
	});
}
