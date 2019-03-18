import { Registry } from 'game-jolt-frontend-lib/components/registry/registry.service';
import { UserFriendship } from 'game-jolt-frontend-lib/components/user/friendship/friendship.model';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import {
	NamespaceVuexStore,
	VuexAction,
	VuexModule,
	VuexMutation,
	VuexStore,
} from 'game-jolt-frontend-lib/utils/vuex';
import { namespace } from 'vuex-class';
import { UserFriendshipHelper } from '../../components/user/friendships-helper/friendship-helper.service';
import { store } from '../../store';

type RouteActions = {
	sendFriendRequest: void;
	acceptFriendRequest: void;
	cancelFriendRequest: void;
	rejectFriendRequest: void;
	removeFriend: void;
};

type RouteMutations = {
	bootstrapUser: string;
	profilePayload: any;
	overviewPayload: any;
	setUserFriendship: UserFriendship | null;
};

export const RouteStoreName = 'profileRoute';
export const RouteStoreModule = namespace(RouteStoreName);
export const routeStore = NamespaceVuexStore<RouteStore, RouteActions, RouteMutations>(
	store,
	RouteStoreName
);

function updateUser(user: User | null, newUser: User | null) {
	// If we already have a user, just assign new data into it to keep it fresh.
	if (user && newUser && user.id === newUser.id) {
		user.assign(newUser);
		return user;
	}

	return newUser;
}

@VuexModule()
export class RouteStore extends VuexStore<RouteStore, RouteActions, RouteMutations> {
	isOverviewLoaded = false;

	// We will bootstrap this right away, so it should always be set for use.
	user: User | null = null;

	gamesCount = 0;
	videosCount = 0;
	isOnline = false;
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
	bootstrapUser(username: RouteMutations['bootstrapUser']) {
		const prevId = this.user && this.user.id;
		const user = Registry.find<User>('User', i => i.username === username);
		this.user = updateUser(this.user, user);

		if ((this.user && this.user.id) !== prevId) {
			this.isOverviewLoaded = false;
			this.gamesCount = 0;
			this.isOnline = false;
			this.videosCount = 0;
			this.userFriendship = null;
		}
	}

	@VuexMutation
	profilePayload($payload: RouteMutations['profilePayload']) {
		const user = new User($payload.user);
		this.user = updateUser(this.user, user);

		this.gamesCount = $payload.gamesCount || 0;
		this.isOnline = $payload.isOnline || false;
		this.videosCount = $payload.videosCount || 0;

		if ($payload.userFriendship) {
			this.userFriendship = new UserFriendship($payload.userFriendship);
		} else {
			this.userFriendship = null;
		}
	}

	@VuexMutation
	overviewPayload(_payload: RouteMutations['overviewPayload']) {
		// This is the only thing we care about globally.
		this.isOverviewLoaded = true;
	}

	@VuexMutation
	setUserFriendship(friendship: RouteMutations['setUserFriendship']) {
		this.userFriendship = friendship;
	}
}
