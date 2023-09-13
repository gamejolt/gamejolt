import { arrayIndexBy } from '../../../utils/array';
import { GameModel } from '../../game/game.model';
import { GameTrophyModel } from '../../game/trophy/trophy.model';
import { UserBaseTrophyModel } from './user-base-trophy.model';

export class UserGameTrophy extends UserBaseTrophyModel {
	game_id!: number;
	game_trophy_id!: number;

	game_trophy?: GameTrophyModel;
	game?: GameModel;

	constructor(data: any = {}) {
		super(data);

		if (data.game_trophy) {
			this.game_trophy = new GameTrophyModel(data.game_trophy);
		}
		if (data.game) {
			this.game = new GameModel(data.game);
		}
	}

	get trophy() {
		return this.game_trophy;
	}

	get key() {
		return 'game-trophy-' + this.id;
	}

	async $view() {
		this.$_save(`/web/profile/trophies/view-game/${this.id}`, 'userGameTrophy');
	}
}

/**
 * Indexes the achieved trophies by their trophy ID.
 */
export function indexAchievedGameTrophies(trophies: UserGameTrophy[]) {
	return arrayIndexBy(trophies, 'game_trophy_id');
}
