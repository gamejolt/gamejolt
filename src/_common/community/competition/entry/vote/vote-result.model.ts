import { Model } from '~common/model/model.service';

export class CommunityCompetitionEntryVoteResultModel extends Model {
	declare community_competition_voting_category_id: number | null;
	declare rating: number;
	declare rank: number;
}
