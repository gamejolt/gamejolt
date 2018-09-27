import View from '!view!./followers.html';
import { AppTrackEvent } from 'game-jolt-frontend-lib/components/analytics/track-event.directive.vue';
import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolve,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { AppUserCard } from 'game-jolt-frontend-lib/components/user/card/card';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { RouteState, RouteStore } from '../profile.store';

@View
@Component({
	name: 'RouteProfileFollowers',
	components: {
		AppUserCard,
	},
	directives: {
		AppTrackEvent,
	},
})
export default class RouteProfileFollowers extends BaseRouteComponent {
	@RouteState
	user!: RouteStore['user'];

	users: User[] = [];

	@RouteResolve({ lazy: true, cache: true })
	routeResolve(this: undefined, route: Route) {
		return Api.sendRequest('/web/profile/followers/@' + route.params.username);
	}

	routed($payload: any) {
		this.users = User.populate($payload.users);
	}

	loadMore() {}
}
