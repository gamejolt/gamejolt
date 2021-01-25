import { CommunityCompetitionEntry } from '../../../../../../_common/community/competition/entry/entry.model';
import { Modal } from '../../../../../../_common/modal/modal.service';
import AppCommunityCompetitionEntryModal from './modal.vue';

export class CommunityCompetitionEntryModal {
	static async showEntry(entry: CommunityCompetitionEntry) {
		return this.show({ entry });
	}

	static async showId(entryId: number) {
		return this.show({ entryId });
	}

	private static async show(props: any) {
		return await Modal.show<void>({
			modalId: 'CommunityCompetitionEntry',
			component: AppCommunityCompetitionEntryModal,
			// component: () =>
			// 	asyncComponentLoader(
			// 		import(/* webpackChunkName: "CommunityCompetitionEntryModal" */ './modal.vue')
			// 	),
			props,
			size: 'lg',
		});
	}
}
