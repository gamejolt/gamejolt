import { defineAsyncComponent } from 'vue';

import { CommunityCompetitionModel } from '~common/community/competition/competition.model';
import { showModal } from '~common/modal/modal.service';

export async function showCommunityCompetitionHeaderModal(competition: CommunityCompetitionModel) {
	return await showModal<CommunityCompetitionModel>({
		modalId: 'CommunityCompetitionHeader',
		component: defineAsyncComponent(
			() =>
				import('~app/components/community/competition/header-modal/AppCommunityCompetitionHeaderModal.vue')
		),
		props: {
			competition,
		},
		size: 'sm',
		noBackdropClose: true,
	});
}
