import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../modal/modal.service';
import { CommunityCompetition } from '../../competition.model';
import { CommunityCompetitionEntry } from '../entry.model';

export class CommunityCompetitionEntrySubmitModal {
	static async show(competition: CommunityCompetition) {
		return await showModal<CommunityCompetitionEntry>({
			modalId: 'CommunityCompetitionEntrySubmit',
			component: defineAsyncComponent(
				() =>
					import(
						/* webpackChunkName: "CommunityCompetitionEntrySubmitModal" */ './submit-modal.vue'
					)
			),
			props: {
				competition,
			},
			size: 'sm',
		});
	}
}
