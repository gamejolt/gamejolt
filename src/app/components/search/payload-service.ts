import { User } from '../../../lib/gj-lib-client/components/user/user.model';
import { Game } from '../../../lib/gj-lib-client/components/game/game.model';
import { LocalDbGame } from '../client/local-db/game/game.model';

export class SearchPayload {
	users: User[];
	games: Game[];
	devlogs: Game[];
	libraryGames: LocalDbGame[];

	constructor(public type: string, data: any) {
		if (data) {
			Object.assign(this, data);
		}

		this.users = User.populate(data.users);
		this.games = Game.populate(data.games);
		this.devlogs = Game.populate(data.devlogs);
		this.libraryGames = [];

		if (GJ_IS_CLIENT) {
			this.libraryGames = data.libraryGames || [];
		}
	}
}
