import { Api } from '../../../../api/api.service';
import { Model } from '../../../../model/model.service';
import { CommunityCompetitionAwardModel } from '../../award/award.model';

export class CommunityCompetitionEntryAwardModel extends Model {
	declare community_competition_entry_id: number;
	declare sort: number;

	declare community_competition_award: CommunityCompetitionAwardModel;

	constructor(data: any = {}) {
		super(data);

		if (data.community_competition_award) {
			this.community_competition_award = new CommunityCompetitionAwardModel(
				data.community_competition_award
			);
		}
	}
}

export function $saveSortCommunityCompetitionEntryAward(awardId: number, sortedIds: number[]) {
	return Api.sendRequest(
		`/web/dash/communities/competitions/awards/save-entry-sort/${awardId}`,
		sortedIds
	);
}

export function $assignCommunityCompetitionEntryAward(entryId: number, awardId: number) {
	return Api.sendRequest(
		`/web/dash/communities/competitions/awards/entry-assign/${awardId}/${entryId}`,
		{}
	);
}

export function $unassignCommunityCompetitionEntryAward(entryId: number, awardId: number) {
	return Api.sendRequest(
		`/web/dash/communities/competitions/awards/entry-unassign/${awardId}/${entryId}`,
		{}
	);
}
