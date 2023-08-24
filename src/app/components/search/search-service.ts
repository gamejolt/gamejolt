import { reactive } from 'vue';
import { Api } from '../../../_common/api/api.service';
import { CommunityModel } from '../../../_common/community/community.model';
import { FiresidePostModel } from '../../../_common/fireside/post/post-model';
import { GameModel } from '../../../_common/game/game.model';
import { RealmModel } from '../../../_common/realm/realm-model';
import { UserModel } from '../../../_common/user/user.model';
import type { ClientLibraryStore } from '../../store/client-library';
import type { LocalDbGame } from '../client/local-db/game/game.model';

export interface SearchOptions {
	type: 'all' | 'user' | 'game' | 'community' | 'realms' | 'typeahead';
	page?: number;
}

class SearchService {
	query = '';
}

export const Search = reactive(new SearchService()) as SearchService;

let clientLibraryStore: ClientLibraryStore | undefined;

export function setClientLibraryStore(newClientLibraryStore: ClientLibraryStore) {
	clientLibraryStore = newClientLibraryStore;
}

export async function sendSearch(query: string, options: SearchOptions = { type: 'all' }) {
	const searchPromises: Promise<any>[] = [];
	searchPromises.push(_searchSite(query, options));

	// If we're in client, let's try to search their installed games.
	if (GJ_IS_DESKTOP_APP && options.type && options.type === 'typeahead') {
		searchPromises.push(_findInstalledGamesByTitle(query));
	}

	const payloads = await Promise.all(searchPromises);

	const searchPayload = payloads[0];
	const libraryPayload = payloads.length > 1 ? payloads[1] : null;

	searchPayload.libraryGames = libraryPayload || [];

	return new SearchPayload(options.type, searchPayload);
}

async function _searchSite(query: string, options: SearchOptions = { type: 'all' }): Promise<any> {
	const requestOptions: any = {};

	let endpoint = '/web/search';
	if (options.type === 'user') {
		endpoint += '/users';
	} else if (options.type === 'game') {
		endpoint += '/games';
	} else if (options.type === 'community') {
		endpoint += '/communities';
	} else if (options.type === 'realms') {
		endpoint += '/realms';
	} else if (options.type === 'typeahead') {
		endpoint += '/typeahead';
		requestOptions.detach = true;
	}

	const searchParams = ['q=' + encodeURIComponent(query || ''), 'post-feed-use-offset=1'];

	if (options.page && options.page > 1) {
		searchParams.push('page=' + options.page);
	}

	// Catch failures and return an empty success instead.
	try {
		return await Api.sendRequest(endpoint + '?' + searchParams.join('&'), null, requestOptions);
	} catch (_e) {
		return Promise.resolve({});
	}
}

async function _findInstalledGamesByTitle(query: string) {
	return clientLibraryStore?.findInstalledGamesByTitle(query, 3) || [];
}

export class SearchPayload {
	page: number;
	perPage: number;
	count: number;

	users: UserModel[];
	usersCount: number;
	games: GameModel[];
	gamesCount: number;
	posts: FiresidePostModel[];
	postsCount: number;
	postsPerPage: number;
	communities: CommunityModel[];
	communitiesCount: number;
	realms: RealmModel[];
	realmsCount: number;
	libraryGames: LocalDbGame[];

	socialMetadata?: {
		description: string;
		fb: string;
		twitter: string;
	};

	constructor(public type: string, data: any) {
		this.page = data.page || 1;
		this.perPage = data.perPage || 24;
		this.count = data.count || 0;

		this.users = UserModel.populate(data.users);
		this.usersCount = data.usersCount || 0;
		this.games = GameModel.populate(data.games);
		this.gamesCount = data.gamesCount || 0;
		this.posts = FiresidePostModel.populate(data.posts);
		this.postsCount = data.postsCount || 0;
		this.postsPerPage = data.postsPerPage || 0;
		this.communities = CommunityModel.populate(data.communities);
		this.communitiesCount = data.communitiesCount || 0;
		this.realms = RealmModel.populate(data.realms);
		this.realmsCount = data.realmsCount || 0;
		this.libraryGames = [];

		if (GJ_IS_DESKTOP_APP) {
			this.libraryGames = data.libraryGames || [];
		}

		if (data.metaDescription) {
			this.socialMetadata = {
				description: data.metaDescription,
				fb: data.fb,
				twitter: data.twitter,
			};
		}
	}
}
