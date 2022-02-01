import { defineAsyncComponent } from 'vue';
import { CommunityCompetition } from '../../../../../_common/community/competition/competition.model';
import { showModal } from '../../../../../_common/modal/modal.service';

export class CommunityCompetitionHeaderModal {
	static async show(competition: CommunityCompetition) {
		return await showModal<CommunityCompetition>({
			modalId: 'CommunityCompetitionHeader',
			component: defineAsyncComponent(() => import('./header-modal.vue')),
			props: {
				competition,
			},
			size: 'sm',
			noBackdropClose: true,
		});
	}
}
