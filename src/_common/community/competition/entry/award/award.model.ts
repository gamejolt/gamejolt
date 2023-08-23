import { Api } from '../../../../api/api.service';
import { Model } from '../../../../model/model.service';
import { CommunityCompetitionAward } from '../../award/award.model';

export class CommunityCompetitionEntryAward extends Model {
	community_competition_entry_id!: number;
	sort!: number;

	community_competition_award!: CommunityCompetitionAward;

	constructor(data: any = {}) {
		super(data);

		if (data.community_competition_award) {
			this.community_competition_award = new CommunityCompetitionAward(
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
