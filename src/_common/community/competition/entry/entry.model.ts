import { Environment } from '../../../environment/environment.service';
import { GameModel } from '../../../game/game.model';
import { Model } from '../../../model/model.service';
import { UserModel } from '../../../user/user.model';
import { CommunityCompetitionEntryAwardModel } from './award/award.model';
import { CommunityCompetitionEntryVoteResultModel } from './vote/vote-result.model';

type EntryType = 'Game';

export class CommunityCompetitionEntryModel extends Model {
	declare community_competition_id: number;
	declare added_on: number;
	declare type: EntryType;
	declare vote_count: number;

	declare is_removed: boolean | null;

	declare user: UserModel;
	declare resource: GameModel;
	declare vote_results: CommunityCompetitionEntryVoteResultModel[];
	declare awards: CommunityCompetitionEntryAwardModel[];

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
}

export function $removeCommunityCompetitionEntry(model: CommunityCompetitionEntryModel) {
	return model.$_remove(`/web/communities/competitions/entries/remove-entry/${model.id}`);
}

export function $hideCommunityCompetitionEntry(model: CommunityCompetitionEntryModel) {
	return model.$_save(
		`/web/dash/communities/competitions/entries/remove-entry/${model.id}`,
		'entry'
	);
}

export function $unhideCommunityCompetitionEntry(model: CommunityCompetitionEntryModel) {
	return model.$_save(
		`/web/dash/communities/competitions/entries/unremove-entry/${model.id}`,
		'entry'
	);
}
