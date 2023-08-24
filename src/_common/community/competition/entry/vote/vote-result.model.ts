import { Model } from '../../../../model/model.service';

export class CommunityCompetitionEntryVoteResultModel extends Model {
	community_competition_voting_category_id!: number | null;
	rating!: number;
	rank!: number;
}
