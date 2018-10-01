import View from '!view!./follow-list.html';
import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive.vue';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { AppUserCard } from 'game-jolt-frontend-lib/components/user/card/card';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { AppLoading } from 'game-jolt-frontend-lib/vue/components/loading/loading';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { RouteState, RouteStore } from '../profile.store';
import { Screen } from './../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppUserCardPlaceholder } from './../../../../lib/gj-lib-client/components/user/card/placeholder/placeholder';

export function makeRouteFollowList(routeName: string) {
	const followType = routeName === 'RouteProfileFollowers' ? 'followers' : 'following';

	function getFetchUrl(route: Route, page = 0) {
		let url = `/web/profile/${followType}/@${route.params.username}`;

		if (page) {
			url += `?page=${page}`;
		}

		return url;
	}

	@View
	@Component({
		name: routeName,
		components: {
			AppUserCard,
			AppUserCardPlaceholder,
			AppLoading,
		},
		directives: {
			AppTrackEvent,
		},
	})
	class RouteProfileFollowList extends BaseRouteComponent {
		@RouteState
		user!: RouteStore['user'];

		users: User[] = [];
		page = 1;
		isLoading = false;
		reachedEnd = false;

		get placeholderCount() {
			if (Screen.isXs) {
				return 1;
			} else if (Screen.isSm) {
				return 2;
			} else if (Screen.isMd) {
				return 3;
			}
			return 4;
		}

		get followType() {
			return followType;
		}

		get followCount() {
			if (followType === 'followers') {
				return this.user!.follower_count || 0;
			}
			return this.user!.following_count || 0;
		}

		get routeTitle() {
			if (this.user) {
				const title = `${this.user.display_name} (@${this.user.username})`;
				if (followType === 'followers') {
					return `People following ${title}`;
				} else {
					return `People followed by ${title}`;
				}
			}
			return null;
		}

		get shouldShowLoadMore() {
			return this.users.length < this.followCount && !this.reachedEnd;
		}

		@RouteResolve({ lazy: true, cache: true })
		routeResolve(this: undefined, route: Route) {
			return Api.sendRequest(getFetchUrl(route));
		}

		routed($payload: any) {
			this.users = User.populate($payload.users);
		}

		async loadPage() {
			const payload = await Api.sendRequest(getFetchUrl(this.$route, this.page));
			return User.populate(payload.users);
		}

		async loadMore() {
			if (this.isLoading) {
				return;
			}

			this.page++;
			this.isLoading = true;

			const pageUsers = await this.loadPage();
			if (!pageUsers || !pageUsers.length) {
				this.page--;
				this.reachedEnd = true;
			} else {
				this.users.push(...pageUsers);
			}

			this.isLoading = false;
		}
	}

	return RouteProfileFollowList;
}
