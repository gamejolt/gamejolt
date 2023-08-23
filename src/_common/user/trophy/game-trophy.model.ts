import { arrayIndexBy } from '../../../utils/array';
import { Game } from '../../game/game.model';
import { GameTrophy } from '../../game/trophy/trophy.model';
import { UserBaseTrophy } from './user-base-trophy.model';

export class UserGameTrophy extends UserBaseTrophy {
	game_id!: number;
	game_trophy_id!: number;

	game_trophy?: GameTrophy;
	game?: Game;

	constructor(data: any = {}) {
		super(data);

		if (data.game_trophy) {
			this.game_trophy = new GameTrophy(data.game_trophy);
		}
		if (data.game) {
			this.game = new Game(data.game);
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
