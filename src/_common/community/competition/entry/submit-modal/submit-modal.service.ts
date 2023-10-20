import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../modal/modal.service';
import { CommunityCompetitionModel } from '../../competition.model';
import { CommunityCompetitionEntryModel } from '../entry.model';

export async function showCommunityCompetitionEntrySubmitModal(
	competition: CommunityCompetitionModel
) {
	return await showModal<CommunityCompetitionEntryModel>({
		modalId: 'CommunityCompetitionEntrySubmit',
		component: defineAsyncComponent(
			() => import('./AppCommunityCompetitionEntrySubmitModal.vue')
		),
		props: {
			competition,
		},
		size: 'sm',
	});
}
