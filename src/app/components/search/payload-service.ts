import { Game } from '../../../lib/gj-lib-client/components/game/game.model';
import { User } from '../../../lib/gj-lib-client/components/user/user.model';
import { LocalDbGame } from '../client/local-db/game/game.model';

export class SearchPayload {
	page: number;
	perPage: number;
	count: number;
	isAdultSearch: boolean;

	users: User[];
	usersCount: number;
	games: Game[];
	gamesCount: number;
	devlogs: Game[];
	devlogsCount: number;
	libraryGames: LocalDbGame[];

	constructor(public type: string, data: any) {
		this.page = data.page || 1;
		this.perPage = data.perPage || 24;
		this.count = data.count || 0;
		this.isAdultSearch = data.isAdultSearch || false;

		this.usersCount = data.usersCount || 0;
		this.users = User.populate(data.users);
		this.gamesCount = data.gamesCount || 0;
		this.games = Game.populate(data.games);
		this.devlogsCount = data.devlogsCount || 0;
		this.devlogs = Game.populate(data.devlogs);
		this.libraryGames = [];

		if (GJ_IS_CLIENT) {
			this.libraryGames = data.libraryGames || [];
		}
	}
}
