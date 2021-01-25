import { asyncComponentLoader } from '../../../../../utils/utils';
import { Modal } from '../../../../modal/modal.service';
import { CommunityCompetition } from '../../competition.model';
import { CommunityCompetitionEntry } from '../entry.model';

export class CommunityCompetitionEntrySubmitModal {
	static async show(competition: CommunityCompetition) {
		return await Modal.show<CommunityCompetitionEntry>({
			modalId: 'CommunityCompetitionEntrySubmit',
			component: () =>
				asyncComponentLoader(
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
