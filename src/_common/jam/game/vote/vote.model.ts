import { Model } from '../../../model/model.service';
import { Game } from '../../../game/game.model';
import { Api } from '../../../api/api.service';

export class JamGameVote extends Model {
	jam_id!: number;
	jam_voting_category_id!: number;
	game_id!: number;
	user_id!: number;
	rating!: number;

	constructor(data: any = {}) {
		super(data);
	}

	$saveVote(jamId: number, game: Game, voteData: any) {
		return Api.sendRequest('/jams-io/voting/save-vote/' + jamId + '/' + game.id, voteData, {
			detach: true,
			allowComplexData: ['votes'],
		});
	}

	$clearVote(jamId: number, game: Game) {
		return Api.sendRequest(
			'/jams-io/voting/clear-vote/' + jamId + '/' + game.id,
			{},
			{ detach: true }
		);
	}
}

Model.create(JamGameVote);
