import { defineAsyncComponent } from 'vue';

import { CommunityModel } from '~common/community/community.model';
import { showModal } from '~common/modal/modal.service';

export async function showCommunityHeaderModal(community: CommunityModel) {
	return await showModal<CommunityModel>({
		modalId: 'CommunityHeader',
		component: defineAsyncComponent(
			() =>
				import('~app/components/forms/community/header/modal/FormCommunityHeaderModal.vue')
		),
		props: {
			community,
		},
		size: 'sm',
		noBackdropClose: true,
	});
}
