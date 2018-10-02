import View from '!view!./followers.html';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { RouteState, RouteStore } from '../view.store';
import { AppFollowerList } from './../../../../../components/follower/list/list';

function getFetchUrl(route: Route) {
	return `/web/discover/games/followers/${route.params.id}`;
}

@View
@Component({
	name: 'RouteProfileFollowers',
	components: {
		AppFollowerList,
	},
})
export default class RouteProfileFollowers extends BaseRouteComponent {
	@RouteState
	game!: RouteStore['game'];

	users: User[] = [];

	get routeTitle() {
		return this.game ? `People following ${this.game.title}` : null;
	}

	get loadUrl() {
		return getFetchUrl(this.$route);
	}

	@RouteResolve({ cache: true, lazy: true })
	routeResolve(this: undefined, route: Route) {
		return Api.sendRequest(getFetchUrl(route));
	}

	routed($payload: any) {
		this.users = User.populate($payload.users);
	}
}
