import { defineAsyncComponent } from 'vue';
import { CommunityCompetitionModel } from '../../../../../_common/community/competition/competition.model';
import { showModal } from '../../../../../_common/modal/modal.service';

export async function showCommunityCompetitionHeaderModal(competition: CommunityCompetitionModel) {
	return await showModal<CommunityCompetitionModel>({
		modalId: 'CommunityCompetitionHeader',
		component: defineAsyncComponent(() => import('./header-modal.vue')),
		props: {
			competition,
		},
		size: 'sm',
		noBackdropClose: true,
	});
}
