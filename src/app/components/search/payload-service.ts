import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { Game } from '../../../lib/gj-lib-client/components/game/game.model';
import { User } from '../../../lib/gj-lib-client/components/user/user.model';
import { LocalDbGame } from '../client/local-db/game/game.model';

export class SearchPayload {
	users: User[];
	games: Game[];
	devlogs: Game[];
	posts: FiresidePost[];
	libraryGames: LocalDbGame[];

	constructor(public type: string, data: any) {
		if (data) {
			Object.assign(this, data);
		}

		this.users = User.populate(data.users);
		this.games = Game.populate(data.games);
		this.devlogs = Game.populate(data.devlogs);
		this.posts = FiresidePost.populate(data.posts);
		this.libraryGames = [];

		if (GJ_IS_CLIENT) {
			this.libraryGames = data.libraryGames || [];
		}
	}
}
