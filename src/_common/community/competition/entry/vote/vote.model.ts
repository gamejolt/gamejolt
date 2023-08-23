import { Model } from '../../../../model/model.service';

export class CommunityCompetitionEntryVote extends Model {
	community_competition_entry_id!: number;
	community_competition_voting_category_id!: number | null;
	rating!: number;
}
