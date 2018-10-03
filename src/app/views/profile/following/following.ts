import View from '!view!./following.html';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { RouteState, RouteStore } from '../profile.store';
import { AppFollowerList } from './../../../components/follower/list/list';

function getFetchUrl(route: Route) {
	return `/web/profile/following/@${route.params.username}`;
}

@View
@Component({
	name: 'RouteProfileFollowing',
	components: {
		AppFollowerList,
	},
})
export default class RouteProfileFollowing extends BaseRouteComponent {
	@RouteState
	user!: RouteStore['user'];

	users: User[] = [];

	get routeTitle() {
		return this.user
			? `People followed by ${this.user.display_name} (@${this.user.username})`
			: null;
	}

	get loadUrl() {
		return getFetchUrl(this.$route);
	}

	@RouteResolve()
	routeResolve(this: undefined, route: Route) {
		return Api.sendRequest(getFetchUrl(route));
	}

	routed($payload: any) {
		this.users = User.populate($payload.users);
	}
}
