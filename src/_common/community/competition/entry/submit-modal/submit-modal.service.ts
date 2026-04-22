import { defineAsyncComponent } from 'vue';

import { CommunityCompetitionModel } from '~common/community/competition/competition.model';
import { CommunityCompetitionEntryModel } from '~common/community/competition/entry/entry.model';
import { showModal } from '~common/modal/modal.service';

export async function showCommunityCompetitionEntrySubmitModal(
	competition: CommunityCompetitionModel
) {
	return await showModal<CommunityCompetitionEntryModel>({
		modalId: 'CommunityCompetitionEntrySubmit',
		component: defineAsyncComponent(
			() =>
				import('~common/community/competition/entry/submit-modal/AppCommunityCompetitionEntrySubmitModal.vue')
		),
		props: {
			competition,
		},
		size: 'sm',
	});
}
