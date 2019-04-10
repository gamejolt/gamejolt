import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import {
	BaseRouteComponent,
	RouteResolver,
} from 'game-jolt-frontend-lib/components/route/route-component';
import { User } from 'game-jolt-frontend-lib/components/user/user.model';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { RouteStore, RouteStoreModule } from '../profile.store';
import AppFollowerList from '../../../components/follower/list/list.vue';

function getFetchUrl(route: Route) {
	return `/web/profile/followers/@${route.params.username}`;
}

@Component({
	name: 'RouteProfileFollowers',
	components: {
		AppFollowerList,
	},
})
@RouteResolver({
	cache: true,
	lazy: true,
	deps: {},
	resolver: ({ route }) => Api.sendRequest(getFetchUrl(route)),
})
export default class RouteProfileFollowers extends BaseRouteComponent {
	@RouteStoreModule.State
	user!: RouteStore['user'];

	users: User[] = [];

	get routeTitle() {
		return this.user ? `People following ${this.user.display_name} (@${this.user.username})` : null;
	}

	get loadUrl() {
		return getFetchUrl(this.$route);
	}

	routeResolved($payload: any) {
		this.users = User.populate($payload.users);
	}
}
