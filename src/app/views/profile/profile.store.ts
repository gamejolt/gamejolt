import { namespace } from 'vuex-class';
import {
	NamespaceVuexStore,
	VuexAction,
	VuexModule,
	VuexMutation,
	VuexStore,
} from '../../../utils/vuex';
import { Registry } from '../../../_common/registry/registry.service';
import { UserFriendship } from '../../../_common/user/friendship/friendship.model';
import { populateTrophies } from '../../../_common/user/trophy/trophy-utils';
import { UserBaseTrophy } from '../../../_common/user/trophy/user-base-trophy.model';
import { User } from '../../../_common/user/user.model';
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
	communitiesCount = 0;
	placeholderCommunitiesCount = 0;
	trophyCount = 0;
	userFriendship: UserFriendship | null = null;
	previewTrophies: UserBaseTrophy[] | null = null;

	@VuexAction
	async sendFriendRequest() {
		if (this.user) {
			this.setUserFriendship(await UserFriendshipHelper.sendRequest(this.user));
			// We follow the user after sending the friend request.
			if (!this.user.is_following) {
				this.user.is_following = true;
				this.user.follower_count++;
			}
		}
	}

	@VuexAction
	async acceptFriendRequest() {
		if (this.userFriendship) {
			const accepted = await UserFriendshipHelper.acceptRequest(this.userFriendship);
			if (accepted) {
				this.setUserFriendship(this.userFriendship);
				// We follow the user after accepting the friend request.
				if (this.user && !this.user.is_following) {
					this.user.is_following = true;
					this.user.follower_count++;
				}
			} else {
				this.setUserFriendship(null);
			}
		}
	}

	@VuexAction
	async cancelFriendRequest() {
		if (this.userFriendship) {
			if (!(await UserFriendshipHelper.cancelRequest(this.userFriendship))) {
				return false;
			}
		}
		this.setUserFriendship(null);
		return true;
	}

	@VuexAction
	async rejectFriendRequest() {
		if (this.userFriendship) {
			if (!(await UserFriendshipHelper.rejectRequest(this.userFriendship))) {
				return false;
			}
		}
		this.setUserFriendship(null);
		return true;
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
		const user = Registry.find<User>(
			'User',
			i => i.username.toLowerCase() === username.toLowerCase()
		);
		this.user = updateUser(this.user, user);

		if ((this.user && this.user.id) !== prevId) {
			this.isOverviewLoaded = false;
			this.gamesCount = 0;
			this.communitiesCount = 0;
			this.placeholderCommunitiesCount = 0;
			this.trophyCount = 0;
			this.userFriendship = null;
			this.previewTrophies = null;
		}
	}

	@VuexMutation
	profilePayload($payload: RouteMutations['profilePayload']) {
		const user = new User($payload.user);
		this.user = updateUser(this.user, user);

		this.gamesCount = $payload.gamesCount || 0;
		this.communitiesCount = $payload.communitiesCount || 0;
		this.placeholderCommunitiesCount = $payload.placeholderCommunitiesCount || 0;
		this.trophyCount = $payload.trophyCount || 0;

		if ($payload.userFriendship) {
			this.userFriendship = new UserFriendship($payload.userFriendship);
		} else {
			this.userFriendship = null;
		}

		if ($payload.previewTrophies) {
			this.previewTrophies = populateTrophies($payload.previewTrophies);
		} else {
			this.previewTrophies = null;
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
