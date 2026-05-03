import { Api } from '~common/api/api.service';
import { Model } from '~common/model/model.service';

export const GameScoreTableSortingDirectionDesc = 0;
export const GameScoreTableSortingDirectionAsc = 1;

export type GameScoreTableSorting =
	| typeof GameScoreTableSortingDirectionDesc
	| typeof GameScoreTableSortingDirectionAsc;

export class GameScoreTableModel extends Model {
	declare game_id: number;
	declare name: string;
	declare description: string;
	declare sort: GameScoreTableSorting;
	declare allow_guest_scores: boolean;
	declare scores_sorting_direction: number;
	declare unique_scores: boolean;
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
