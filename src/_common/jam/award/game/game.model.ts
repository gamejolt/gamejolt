import { Model } from '../../../model/model.service';
import { Api } from '../../../api/api.service';
import { JamAward } from '../award.model';

export class JamAwardGame extends Model {
	jam_id!: number;
	game_id!: number;
	jam_award_id!: number;
	jam_award!: JamAward;
	sort!: number;

	constructor(data: any = {}) {
		super(data);

		if (data.jam_award) {
			this.jam_award = new JamAward(data.jam_award);
		}
	}

	static $saveSort(awardId: number, sortedIds: number[]) {
		return Api.sendRequest('/jams/manage/jams/awards/save-game-sort/' + awardId, sortedIds);
	}

	static async $assignToAward(awardId: number, gameId: number) {
		// Force POST.
		const response = await Api.sendRequest(
			'/jams/manage/jams/awards/assign-game/' + awardId + '/' + gameId,
			{}
		);

		await JamAwardGame.processCreate(response, 'jamAwardGame');
		return new JamAwardGame(response.jamAwardGame);
	}

	$remove() {
		return this.$_remove(
			'/jams/manage/jams/awards/remove-assigned-game/' + this.jam_award_id + '/' + this.game_id
		);
	}
}

Model.create(JamAwardGame);
