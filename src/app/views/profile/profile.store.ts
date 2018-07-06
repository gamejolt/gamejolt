import { Action, Mutation, namespace, State } from 'vuex-class';
import {
	VuexModule,
	VuexStore,
	VuexAction,
	VuexMutation,
} from '../../../lib/gj-lib-client/utils/vuex';
import { User } from '../../../lib/gj-lib-client/components/user/user.model';
import { MediaItem } from '../../../lib/gj-lib-client/components/media-item/media-item-model';
import { UserFriendship } from '../../../lib/gj-lib-client/components/user/friendship/friendship.model';
import { UserFriendshipHelper } from '../../components/user/friendships-helper/friendship-helper.service';
import { Registry } from '../../../lib/gj-lib-client/components/registry/registry.service';

export const RouteStoreName = 'profileRoute';
export const RouteState = namespace(RouteStoreName, State);
export const RouteAction = namespace(RouteStoreName, Action);
export const RouteMutation = namespace(RouteStoreName, Mutation);

type Actions = {
	sendFriendRequest: void;
	acceptFriendRequest: void;
	cancelFriendRequest: void;
	rejectFriendRequest: void;
	removeFriend: void;
};

type Mutations = {
	bootstrapUser: string;
	profilePayload: any;
	setUserFriendship: UserFriendship | null;
};

@VuexModule()
export class RouteStore extends VuexStore<RouteStore, Actions, Mutations> {
	user: User | null = null;
	headerMediaItem: MediaItem | null = null;
	gamesCount = 0;
	videosCount = 0;
	isOnline = false;
	libraryGamesCount = 0;
	userFriendship: UserFriendship | null = null;

	@VuexAction
	async sendFriendRequest() {
		if (this.user) {
			this.setUserFriendship(await UserFriendshipHelper.sendRequest(this.user));
		}
	}

	@VuexAction
	async acceptFriendRequest() {
		if (this.userFriendship) {
			UserFriendshipHelper.acceptRequest(this.userFriendship);
			this.setUserFriendship(this.userFriendship);
		}
	}

	@VuexAction
	async cancelFriendRequest() {
		if (this.userFriendship) {
			if (!await UserFriendshipHelper.cancelRequest(this.userFriendship)) {
				return;
			}
		}
		this.setUserFriendship(null);
	}

	@VuexAction
	async rejectFriendRequest() {
		if (this.userFriendship) {
			if (!await UserFriendshipHelper.rejectRequest(this.userFriendship)) {
				return;
			}
		}
		this.setUserFriendship(null);
	}

	@VuexAction
	async removeFriend() {
		if (this.userFriendship) {
			if (!await UserFriendshipHelper.removeFriend(this.userFriendship)) {
				return;
			}
		}
		this.setUserFriendship(null);
	}

	@VuexMutation
	bootstrapUser(username: Mutations['bootstrapUser']) {
		this.user = Registry.find<User>('User', username, 'username');
		console.log('bootstrapping user', username, this.user);
		// setAds(this.game);
		// this.showDescription = false;
		// this.isOverviewLoaded = false;
		// this.recommendedGames = [];
		// this.mediaItems = [];
	}

	@VuexMutation
	profilePayload($payload: Mutations['profilePayload']) {
		this.user = new User($payload.user);

		this.headerMediaItem = $payload.headerMediaItem
			? new MediaItem($payload.headerMediaItem)
			: null;
		this.gamesCount = $payload.gamesCount || 0;
		this.isOnline = $payload.isOnline || false;
		this.libraryGamesCount = $payload.libraryGamesCount || 0;
		this.videosCount = $payload.videosCount || 0;

		if ($payload.userFriendship) {
			this.userFriendship = new UserFriendship($payload.userFriendship);
		} else {
			this.userFriendship = null;
		}
	}

	@VuexMutation
	setUserFriendship(friendship: Mutations['setUserFriendship']) {
		this.userFriendship = friendship;
	}
}
