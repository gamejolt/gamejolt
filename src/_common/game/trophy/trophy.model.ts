import { Model } from '../../model/model.service';
import { UserGameTrophy } from '../../user/game-trophy/game-trophy.model';
import { Api } from '../../api/api.service';

export type GameTrophyDifficulty = 1 | 2 | 3 | 4;

export class GameTrophy extends Model {
	static readonly DIFFICULTY_BRONZE = 1;
	static readonly DIFFICULTY_SILVER = 2;
	static readonly DIFFICULTY_GOLD = 3;
	static readonly DIFFICULTY_PLATINUM = 4;

	static readonly difficulties = [
		GameTrophy.DIFFICULTY_BRONZE,
		GameTrophy.DIFFICULTY_SILVER,
		GameTrophy.DIFFICULTY_GOLD,
		GameTrophy.DIFFICULTY_PLATINUM,
	];

	static readonly difficultyLabels: { [k: string]: string } = {
		[GameTrophy.DIFFICULTY_BRONZE]: 'Bronze',
		[GameTrophy.DIFFICULTY_SILVER]: 'Silver',
		[GameTrophy.DIFFICULTY_GOLD]: 'Gold',
		[GameTrophy.DIFFICULTY_PLATINUM]: 'Platinum',
	};

	game_id!: number;
	difficulty!: number;
	title!: string;
	description!: string;
	secret!: boolean;
	visible!: boolean;
	sort!: number;
	experience!: number;
	img_thumbnail!: string;
	has_thumbnail!: boolean;
	is_owner!: boolean;

	constructor(data: any = {}) {
		super(data);
	}

	get difficultyLabel() {
		return GameTrophy.difficultyLabels[this.difficulty];
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

Model.create(GameTrophy);
