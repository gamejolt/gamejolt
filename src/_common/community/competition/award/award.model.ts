import { Api } from '../../../api/api.service';
import { Model } from '../../../model/model.service';

export class CommunityCompetitionAwardModel extends Model {
	declare community_competition_id: number;
	declare name: string;
	declare description: string | null;
	declare sort: number;

	declare entry_count: number | null;
}

export function $saveCommunityCompetitionAwardSort(competitionId: number, awardIds: number[]) {
	return Api.sendRequest(
		`/web/dash/communities/competitions/awards/save-sort/${competitionId}`,
		awardIds
	);
}

export function $saveCommunityCompetitionAward(model: CommunityCompetitionAwardModel) {
	if (model.id) {
		// Save existing award.
		return model.$_save(`/web/dash/communities/competitions/awards/save/${model.id}`, 'award');
	}

	// Create new award.
	return model.$_save(`/web/dash/communities/competitions/awards/save`, 'award');
}

export function $removeCommunityCompetitionAward(model: CommunityCompetitionAwardModel) {
	return model.$_remove(`/web/dash/communities/competitions/awards/remove/${model.id}`);
}
