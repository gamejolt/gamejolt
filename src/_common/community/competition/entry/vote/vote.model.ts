import { Model } from '../../../../model/model.service';

export class CommunityCompetitionEntryVoteModel extends Model {
	community_competition_entry_id!: number;
	community_competition_voting_category_id!: number | null;
	rating!: number;
}
