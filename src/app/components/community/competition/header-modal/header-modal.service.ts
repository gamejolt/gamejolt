import { defineAsyncComponent } from 'vue';
import { CommunityCompetitionModel } from '../../../../../_common/community/competition/competition.model';
import { showModal } from '../../../../../_common/modal/modal.service';

export async function showCommunityCompetitionHeaderModal(competition: CommunityCompetitionModel) {
	return await showModal<CommunityCompetitionModel>({
		modalId: 'CommunityCompetitionHeader',
		component: defineAsyncComponent(() => import('./AppCommunityCompetitionHeaderModal.vue')),
		props: {
			competition,
		},
		size: 'sm',
		noBackdropClose: true,
	});
}
