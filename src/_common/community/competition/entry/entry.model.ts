import { Environment } from '../../../environment/environment.service';
import { GameModel } from '../../../game/game.model';
import { Model } from '../../../model/model.service';
import { UserModel } from '../../../user/user.model';
import { CommunityCompetitionEntryAwardModel } from './award/award.model';
import { CommunityCompetitionEntryVoteResultModel } from './vote/vote-result.model';

type EntryType = 'Game';

export class CommunityCompetitionEntryModel extends Model {
	community_competition_id!: number;
	added_on!: number;
	type!: EntryType;
	vote_count!: number;

	is_removed!: boolean | null;

	user!: UserModel;
	resource!: GameModel;
	vote_results!: CommunityCompetitionEntryVoteResultModel[];
	awards!: CommunityCompetitionEntryAwardModel[];

	get author() {
		return this.resource.developer;
	}

	get permalink() {
		return Environment.baseUrl + '/x/permalink/jam-entry/' + this.id;
	}

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new UserModel(data.user);
		}

		if (data.resource) {
			switch (this.type) {
				case 'Game':
					this.resource = new GameModel(data.resource);
					break;
				default:
					console.error('Not implemented resource type', this.type);
					break;
			}
		}

		if (data.vote_results) {
			this.vote_results = CommunityCompetitionEntryVoteResultModel.populate(
				data.vote_results
			);
		}
	}

	$remove() {
		return this.$_remove(`/web/communities/competitions/entries/remove-entry/${this.id}`);
	}

	$hideEntry() {
		return this.$_save(
			`/web/dash/communities/competitions/entries/remove-entry/${this.id}`,
			'entry'
		);
	}

	$unhideEntry() {
		return this.$_save(
			`/web/dash/communities/competitions/entries/unremove-entry/${this.id}`,
			'entry'
		);
	}
}
