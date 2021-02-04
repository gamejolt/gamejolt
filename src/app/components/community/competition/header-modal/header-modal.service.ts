import { asyncComponentLoader } from '../../../../../utils/utils';
import { CommunityCompetition } from '../../../../../_common/community/competition/competition.model';
import { Modal } from '../../../../../_common/modal/modal.service';

export class CommunityCompetitionHeaderModal {
	static async show(competition: CommunityCompetition) {
		return await Modal.show<CommunityCompetition>({
			modalId: 'CommunityCompetitionHeader',
			component: () =>
				asyncComponentLoader(
					import(
						/* webpackChunkName: "CommunityCompetitionHeaderModal" */ './header-modal.vue'
					)
				),
			props: {
				competition,
			},
			size: 'sm',
			noBackdropClose: true,
		});
	}
}
