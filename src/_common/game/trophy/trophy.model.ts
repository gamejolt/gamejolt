import { Api } from '../../api/api.service';
import { BaseTrophyModel } from '../../trophy/base-trophy.model';
import { UserGameTrophy } from '../../user/trophy/game-trophy.model';

export class GameTrophy extends BaseTrophyModel {
	game_id!: number;
	sort!: number;

	constructor(data: any = {}) {
		super(data);
	}

	/**
	 * Splits out the trophies by achieved/unachieved.
	 */
	static splitAchieved(trophies: GameTrophy[], achievedIndexed: { [k: number]: UserGameTrophy }) {
		return {
			achieved: trophies.filter(trophy => achievedIndexed[trophy.id]),
			unachieved: trophies.filter(trophy => !achievedIndexed[trophy.id]),
		};
	}

	static $saveSort(gameId: number, difficulty: number, sort: any) {
		return Api.sendRequest(
			`/web/dash/developer/games/api/trophies/save-sort/${gameId}/${difficulty}`,
			sort
		);
	}

	$save() {
		if (!this.id) {
			return this.$_save(
				`/web/dash/developer/games/api/trophies/save/${this.game_id}`,
				'gameTrophy',
				{ file: this.file }
			);
		} else {
			// May or may not have an upload file on an edit.
			return this.$_save(
				`/web/dash/developer/games/api/trophies/save/${this.game_id}/${this.id}`,
				'gameTrophy',
				{ file: this.file }
			);
		}
	}

	$clearImage() {
		return this.$_save(
			`/web/dash/developer/games/api/trophies/clear-image/${this.game_id}/${this.id}`,
			'gameTrophy'
		);
	}

	$remove() {
		return this.$_remove(
			`/web/dash/developer/games/api/trophies/remove/${this.game_id}/${this.id}`
		);
	}
}
