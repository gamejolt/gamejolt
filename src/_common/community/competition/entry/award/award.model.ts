import { Api } from '../../../../api/api.service';
import { Model } from '../../../../model/model.service';
import { CommunityCompetitionAwardModel } from '../../award/award.model';

export class CommunityCompetitionEntryAwardModel extends Model {
	community_competition_entry_id!: number;
	sort!: number;

	community_competition_award!: CommunityCompetitionAwardModel;

	constructor(data: any = {}) {
		super(data);

		if (data.community_competition_award) {
			this.community_competition_award = new CommunityCompetitionAwardModel(
				data.community_competition_award
			);
		}
	}

	static $saveSort(awardId: number, sortedIds: number[]) {
		return Api.sendRequest(
			`/web/dash/communities/competitions/awards/save-entry-sort/${awardId}`,
			sortedIds
		);
	}

	static $assign(entryId: number, awardId: number) {
		return Api.sendRequest(
			`/web/dash/communities/competitions/awards/entry-assign/${awardId}/${entryId}`,
			{}
		);
	}

	static $unassign(entryId: number, awardId: number) {
		return Api.sendRequest(
			`/web/dash/communities/competitions/awards/entry-unassign/${awardId}/${entryId}`,
			{}
		);
	}
}
