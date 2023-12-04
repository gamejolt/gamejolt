import { Model } from '../../../../model/model.service';

export class CommunityCompetitionEntryVoteModel extends Model {
	declare community_competition_entry_id: number;
	declare community_competition_voting_category_id: number | null;
	declare rating: number;
}
