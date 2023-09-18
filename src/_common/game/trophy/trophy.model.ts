import { Api } from '../../api/api.service';
import { BaseTrophyDifficulty, BaseTrophyModel } from '../../trophy/base-trophy.model';
import { UserGameTrophyModel } from '../../user/trophy/game-trophy.model';

export class GameTrophyModel extends BaseTrophyModel {
	game_id!: number;
	sort!: number;

	constructor(data: any = {}) {
		super(data);
	}

	/**
	 * Splits out the trophies by achieved/unachieved.
	 */
	static splitAchieved(
		trophies: GameTrophyModel[],
		achievedIndexed: { [k: number]: UserGameTrophyModel }
	) {
		return {
			achieved: trophies.filter(trophy => achievedIndexed[trophy.id]),
			unachieved: trophies.filter(trophy => !achievedIndexed[trophy.id]),
		};
	}
}

export function $saveGameTrophy(model: GameTrophyModel) {
	if (!model.id) {
		return model.$_save(
			`/web/dash/developer/games/api/trophies/save/${model.game_id}`,
			'gameTrophy',
			{ file: model.file }
		);
	} else {
		// May or may not have an upload file on an edit.
		return model.$_save(
			`/web/dash/developer/games/api/trophies/save/${model.game_id}/${model.id}`,
			'gameTrophy',
			{ file: model.file }
		);
	}
}

export function $clearGameTrophyImage(model: GameTrophyModel) {
	return model.$_save(
		`/web/dash/developer/games/api/trophies/clear-image/${model.game_id}/${model.id}`,
		'gameTrophy'
	);
}

export function $removeGameTrophy(model: GameTrophyModel) {
	return model.$_remove(
		`/web/dash/developer/games/api/trophies/remove/${model.game_id}/${model.id}`
	);
}

export function $saveSortGameTrophy(gameId: number, difficulty: BaseTrophyDifficulty, sort: any) {
	return Api.sendRequest(
		`/web/dash/developer/games/api/trophies/save-sort/${gameId}/${difficulty}`,
		sort
	);
}
