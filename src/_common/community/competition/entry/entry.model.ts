import { Game } from '../../../game/game.model';
import { Model } from '../../../model/model.service';
import { User } from '../../../user/user.model';

type EntryType = 'Game';

export class CommunityCompetitionEntry extends Model {
	community_competition_id!: number;
	added_on!: number;
	type!: EntryType;

	user!: User;
	resource!: Game;

	get author() {
		return this.resource.developer;
	}

	constructor(data: any = {}) {
		super(data);

		if (data.user) {
			this.user = new User(data.user);
		}

		if (data.resource) {
			switch (this.type) {
				case 'Game':
					this.resource = new Game(data.resource);
					break;
				default:
					console.error('Not implemented resource type', this.type);
					break;
			}
		}
	}

	$remove() {
		return this.$_remove(`/web/communities/competitions/entries/remove-entry/${this.id}`);
	}
}

Model.create(CommunityCompetitionEntry);
