import { Community } from '../../../_common/community/community.model';
import { FiresidePost } from '../../../_common/fireside/post/post-model';
import { Game } from '../../../_common/game/game.model';
import { User } from '../../../_common/user/user.model';
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
	postsPerPage: number;
	communities: Community[];
	communitiesCount: number;
	libraryGames: LocalDbGame[];

	constructor(public type: string, data: any) {
		this.page = data.page || 1;
		this.perPage = data.perPage || 24;
		this.count = data.count || 0;
		this.isAdultSearch = data.isAdultSearch || false;

		this.users = User.populate(data.users);
		this.usersCount = data.usersCount || 0;
		this.games = Game.populate(data.games);
		this.gamesCount = data.gamesCount || 0;
		this.posts = FiresidePost.populate(data.posts);
		this.postsCount = data.postsCount || 0;
		this.postsPerPage = data.postsPerPage || 0;
		this.communities = Community.populate(data.communities);
		this.communitiesCount = data.communitiesCount || 0;
		this.libraryGames = [];

		if (GJ_IS_CLIENT) {
			this.libraryGames = data.libraryGames || [];
		}
	}
}
