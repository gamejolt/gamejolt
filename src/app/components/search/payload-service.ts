import { FiresidePost } from 'game-jolt-frontend-lib/components/fireside/post/post-model';
import { Game } from 'game-jolt-frontend-lib/components/game/game.model';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
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
	posts: FiresidePost[];
	postsCount: number;
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
		this.posts = FiresidePost.populate(data.posts);
		this.postsCount = data.postsCount || 0;
		this.libraryGames = [];

		if (GJ_IS_CLIENT) {
			this.libraryGames = data.libraryGames || [];
		}
	}
}
