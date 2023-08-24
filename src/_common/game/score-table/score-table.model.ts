import { Api } from '../../api/api.service';
import { Model } from '../../model/model.service';

export class GameScoreTableModel extends Model {
	game_id!: number;
	name!: string;
	description!: string;
	sort!: number;
	allow_guest_scores!: boolean;
	scores_sorting_direction!: number;
	unique_scores!: boolean;

	static readonly SORTING_DIRECTION_DESC = 0;
	static readonly SORTING_DIRECTION_ASC = 1;

	static $saveSort(gameId: number, sort: number[]) {
		return Api.sendRequest(
			'/web/dash/developer/games/api/scores/save-table-sort/' + gameId,
			sort
		);
	}

	$save() {
		if (!this.id) {
			return this.$_save(
				'/web/dash/developer/games/api/scores/save-table/' + this.game_id,
				'gameScoreTable'
			);
		} else {
			return this.$_save(
				'/web/dash/developer/games/api/scores/save-table/' + this.game_id + '/' + this.id,
				'gameScoreTable'
			);
		}
	}

	$remove() {
		return this.$_remove(
			'/web/dash/developer/games/api/scores/remove-table/' + this.game_id + '/' + this.id
		);
	}

	async $removeAllUserScores(userId: number) {
		const params = [this.game_id, this.id, userId].join('/');
		const response = await Api.sendRequest(
			'/web/dash/developer/games/api/scores/remove-table-user-scores/' + params,
			{}
		);

		if (!response.success) {
			throw response;
		}

		return response;
	}
}
