import { Action, Mutation, namespace, State } from 'vuex-class';
import { Registry } from '../../../lib/gj-lib-client/components/registry/registry.service';
import { UserFriendship } from '../../../lib/gj-lib-client/components/user/friendship/friendship.model';
import { User } from '../../../lib/gj-lib-client/components/user/user.model';
import {
	VuexAction,
	VuexModule,
	VuexMutation,
	VuexStore,
} from '../../../lib/gj-lib-client/utils/vuex';
import { UserFriendshipHelper } from '../../components/user/friendships-helper/friendship-helper.service';

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
			if (!(await UserFriendshipHelper.cancelRequest(this.userFriendship))) {
				return;
			}
		}
		this.setUserFriendship(null);
	}

	@VuexAction
	async rejectFriendRequest() {
		if (this.userFriendship) {
			if (!(await UserFriendshipHelper.rejectRequest(this.userFriendship))) {
				return;
			}
		}
		this.setUserFriendship(null);
	}

	@VuexAction
	async removeFriend() {
		if (this.userFriendship) {
			if (!(await UserFriendshipHelper.removeFriend(this.userFriendship))) {
				return;
			}
		}
		this.setUserFriendship(null);
	}

	@VuexMutation
	bootstrapUser(username: Mutations['bootstrapUser']) {
		this.user = Registry.find<User>('User', i => i.username === username);
		this.gamesCount = 0;
		this.isOnline = false;
		this.libraryGamesCount = 0;
		this.videosCount = 0;
		this.userFriendship = null;
	}

	@VuexMutation
	profilePayload($payload: Mutations['profilePayload']) {
		const user = new User($payload.user);
		if (this.user) {
			this.user.assign(user);
		} else {
			this.user = user;
		}

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
