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
}

export function $saveGameScoreTableSort(gameId: number, sort: number[]) {
	return Api.sendRequest('/web/dash/developer/games/api/scores/save-table-sort/' + gameId, sort);
}

export function $saveGameScoreTable(model: GameScoreTableModel) {
	if (!model.id) {
		return model.$_save(
			'/web/dash/developer/games/api/scores/save-table/' + model.game_id,
			'gameScoreTable'
		);
	} else {
		return model.$_save(
			'/web/dash/developer/games/api/scores/save-table/' + model.game_id + '/' + model.id,
			'gameScoreTable'
		);
	}
}

export function $removeGameScoreTable(model: GameScoreTableModel) {
	return model.$_remove(
		'/web/dash/developer/games/api/scores/remove-table/' + model.game_id + '/' + model.id
	);
}

export async function $removeAllUserScoresFromGameScoreTable(
	model: GameScoreTableModel,
	userId: number
) {
	const params = [model.game_id, model.id, userId].join('/');
	const response = await Api.sendRequest(
		'/web/dash/developer/games/api/scores/remove-table-user-scores/' + params,
		{}
	);

	if (!response.success) {
		throw response;
	}

	return response;
}
